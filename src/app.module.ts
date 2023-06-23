import { join } from 'path';

import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongooseModule } from '@nestjs/mongoose';

import { PokemonModule } from './pokemon/pokemon.module';
import { CommonModule } from './common/common.module';

@Module({
    imports: [
      //modulo para integrar la visualizacion de contenido estatico
    ServeStaticModule.forRoot({
    rootPath: join(__dirname,'..','public'),
    }),
    //Modulo para la integracion de la mongodb
    MongooseModule.forRoot('mongodb://localhost:27017/nest-pokemon'),

    PokemonModule,

    CommonModule,
  ],

})
export class AppModule {}
