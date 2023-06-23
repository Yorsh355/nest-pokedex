import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

@Injectable()
export class PokemonService {

//inyectamos la dependecica correspondiente a nuestra entidad para poder crerla en la DB
constructor(
  //pokemonModel es un Modelo de mongoose de tipo Pokemon (osea nuestra entitie)
  @InjectModel(Pokemon.name)//para inyectar el model con mongoose con su propia implementacion con el nombre del modelo 
  private readonly pokemonModel: Model<Pokemon>
){}


  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      //vamos a crearlo en la DB
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
      
    } catch (error) {
      this.handleExceptions(error);
  }
}

  findAll() {
    return `This action returns all pokemon`;
  }


  //Este metodo nos permitira buscar por mongoId, por no de pokemon o por nombre
  async findOne(term: string) {

    let pokemon: Pokemon; //es una referencia para decir que el pokemon es de tipo entiti

    //por NO
    if(!isNaN(+term)){//si term es un numero
      pokemon = await this.pokemonModel.findOne({no: term});
    }

    //Por MongoId
    if(!pokemon && isValidObjectId(term)){//metodo de mongo para saber si el term es un mongoid
      pokemon = await this.pokemonModel.findById(term);
    }

    //Por Name
    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name: term.toLocaleLowerCase().trim()})
    }

    //Si no lo encuentra
    if(!pokemon){
      throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`);
    }

    return pokemon;
  }


  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    //Revisamos si el pokemon que desean actualizar es valido
    const pokemon = await this.findOne(term);

    //si la busqued es por name lo pasamos a minusculas
    if( updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

      try {
        //si es valido entonces tendriamos el modelo del pokemon con todos sus metodos
        await pokemon.updateOne( updatePokemonDto,);
        return {...pokemon.toJSON(), ...updatePokemonDto};
        
      } catch (error) {
        this.handleExceptions(error);
      }

  }

  async remove(id: string) {

    /* //estamos eliminando por no, name o mongoId
    const pokemon = await this.findOne(id);
    //no es necesario retornar nada ya que devuelve un status 200
    await pokemon.deleteOne(); */

    //Generamos un pipe para validar los MongoId y de esta forma borrar solo por MongoId
    //const result = await this.pokemonModel.findByIdAndDelete(id);

    //Vamos a borrar por id teniendo en cuenta que si intentan borrar un id que ya fue borrado debe generar un error
    const { deletedCount } = await this.pokemonModel.deleteOne({_id: id});
    if(deletedCount === 0)
      throw new BadRequestException(`Pokemon with id "${id}" not found`);


    return;
  }


  private handleExceptions(error: any) {
      //para evitar hacer mas de una consulta a la base de datos verificamos si el error corresponde al codigo 11000
      //que sabemos que se da cuando el reistro ya existe.
    if(error.code === 11000){
      //mostramos el error convertido a formato JSON
      throw new BadRequestException(`Pokemon exist in db ${JSON.stringify(error.keyValue)}`);
    }
    //si no es este error ahi si debemos enviar el internal server
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`);
  }
}
