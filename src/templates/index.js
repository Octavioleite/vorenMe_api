import influenciadora from "./influenciadora.js";
import loja from "./loja.js";
import clinicaMedica from "./clinicaMedica.js";
import odontologia from "./odontologia.js";
import psicologia from "./psicologia.js";
import esteticaAutomotiva from "./esteticaAutomotiva.js";
import lojaCarros from "./lojaCarros.js";
import salaoBeleza from "./salaoBeleza.js";
import esteticista from "./esteticista.js";
import barbearia from "./barbearia.js";
import nailDesigner from "./nailDesigner.js";
import lashDesigner from "./lashDesigner.js";
import tatuagem from "./tatuagem.js";
import personalTrainer from "./personalTrainer.js";
import petShop from "./petShop.js";
import advocacia from "./advocacia.js";
import corretorImoveis from "./corretorImoveis.js";
import fotografo from "./fotografo.js";
import nutricionista from "./nutricionista.js";
import confeitaria from "./confeitaria.js";
import restaurante from "./restaurante.js";
import revendedora from "./revendedora.js";
import prestadorServicos from "./prestadorServicos.js";
import oficinaMecanica from "./oficinaMecanica.js";
import fisioterapia from "./fisioterapia.js";
import contador from "./contador.js";
import professor from "./professor.js";
import maquiadora from "./maquiadora.js";
import arquiteto from "./arquiteto.js";
import musico from "./musico.js";
import simples from "./simples.js";

// ponytail: modelos em arquivo, não no banco — mover para uma tabela quando alguém precisar editá-los sem deploy.
export default [
  influenciadora, loja, revendedora, restaurante, confeitaria,
  clinicaMedica, odontologia, psicologia, fisioterapia, nutricionista, personalTrainer,
  esteticaAutomotiva, lojaCarros, oficinaMecanica, prestadorServicos,
  salaoBeleza, esteticista, barbearia, nailDesigner, lashDesigner, maquiadora,
  tatuagem, petShop, professor, musico, arquiteto,
  advocacia, contador, corretorImoveis, fotografo, simples,
];
