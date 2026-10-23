# EXEMPLOS DE CÓDIGO DE PROJETO
- É PROBIDO A CRIAÇÃO DE QUALQUER TIPO DE LÓGICA OU CÓDIGO QUE DESTOE QUE  ALQUER UM DOS CÓDIGOS USADOS DE EXEMPLO 
- crie códigos mais similiares ao exemplos o possivel 
- será permitido o uso da de REACT , CSS E JAVASCRIPT 
- este arquivo deve ser apenas utilizado para a tela NovoFiado.jsx e fiado.jsx exceto se requisitado 

## ROTAS
import { Router } from "express";
import { createPayment, readPayment, showPayment, updatePayment, deletePayment } from "../services/payment.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

router.post('/', authMiddleware, createPayment);
router.get("/", authMiddleware, readPayment);
router.get("/:id", authMiddleware, showPayment);
router.put("/:id", authMiddleware, updatePayment);
router.delete("/:id", authMiddleware, deletePayment);

export default router; 


- não utilize até o momento arquivos de autorização como o authMiddleware 


## CHAMANDO A API

import { useState } from "react"

function Pokedex(){

    const[pokemon, setPokemon] = useState({})
    const[pokePesquisa, setPokePesquisa] = useState("")

    async function pokeBusca(){
        try{

            const request = await fetch("https://pokeapi.co/api/v2/pokemon/"+pokePesquisa) 
            const data = await request.json()
            console.log(data)
            setPokemon(data)
        } catch(e){
            alert("Pokemon não encotrando...")
        }
    }
    return(
        <div>
            <h1>Pokedex</h1>
            <p>Uma Pokedex</p>

            <p>Digite o nome de um Pokemon</p>
            <input onChange={e => setPokePesquisa(e.target.value)}/>
            <button onClick={pokeBusca}>PokéPesquisar</button>

            <hr/>

            {
                pokemon.id == null ?
                        <p>Aguardando...</p>
                :
                    <div>
                        <h2>{pokemon.name.toUpperCase()}</h2>
                        <p>Tipo: {pokemon.types[0].type.name}</p>
                        <p>Habilidade: {pokemon.abilities[0].ability.name}</p>
                        <img src={pokemon.sprites.other.showdown.front_default}/>
                    </div>        

            }

        </div>

    )
}


export default Pokedex


## CRIANDO INTERFACE OU FUNCIONALIADES

### MAIS IMPORTANTE UTILIZAR PARA A CRIAÇÃO DE FUNÇÕES AO BANCO DE DADOS
- ** AO CRIAR O CRUD ESSE CÓDIGO DEVE SER O PARAMETRO MAXIMO  PARA CRIAÇÃO DE QUALQUER FUNÇÃO**
A LIGAÇÃO AO BANCO DE DADOS DEVE SER FEITA A PARTIR DO ARQUIVO .env não deixe A URL E KEY APARECER NESTÉ CÓDIGO 
async function Cadastrar(nome, cpf,email,senha){
 
  const supabaseUrl = "https://kviydyosuprpyzzkwyir.supabase.co"
  const supabaseKey = "sb_publishable_qobC-1_D_SjDHp-h1SaVKg_fDBOLLTK"
  const supabase = createClient(supabaseUrl, supabaseKey);
 
  const {data, error} = await supabase.from('companias').insert({
    nome,
    cpf,
    email,
    senha,
  });
}

### SEGUNDARIO

import { useEffect, useState } from "react"


function App() {

    const [usuarios, setUsuarios] = useState([])


    const[nome, setNome] = useState("")
    const [idade, setIdade] = useState("")

    const[estaEditando, setEstaEditando] = useState(-1)

    function salvar(){ // atende tanto o inserir quanto o alterar.

            const usuario = {
            id: 0, 
            nome: nome,
            idade: idade
        }
        
        setNome("")
        setNome("")

        if(estaEditando == -1){
            usuario.id = usuarios.length + 1
            inserir(usuario)
        }else{
            usuario.id = estaEditando
            alterar(usuario)
            setEstaEditando(-1)
        }
    }


    function inserir(usuario){
        setUsuarios( usuarios.concat(usuario))
    }

    function alterar(usuario){
          const nova_lista = structuredClone(usuarios)

        for(let i = 0; i < nova_lista.length; i++){
            if(nova_lista[i].id == usuario.id){
                nova_lista[i] = usuario
                break
            }
        }

        setUsuarios(nova_lista)
    }

    function buscarTodos(){
        setUsuarios([
    { id: 1, nome: "Rodolfo", idade: 99999 },
    { id: 2, nome: "Silva", idade: 2 },
    { id: 3, nome: "ze", idade: 100  }
    ])
    }



    function remover(id){
        
        const nova_lista = structuredClone(usuarios)

        for(let i = 0; i < nova_lista.length; i++){
            if(nova_lista[i].id == id){
                nova_lista.splice(i, 1)
                break
            }
        }

        setUsuarios(nova_lista)

    }


    function editar(id){

        const usuario = usuarios.filter( i => i.id == id)[0]
        setNome(usuario.nome)
        setIdade(usuario.idade)
        setEstaEditando(usuario.id)
    }


    function cancelarEdicao() {
        setEstaEditando(-1)
        setNome("")
        setIdade("")
    }
    useEffect( ()=> { 
        buscarTodos()
    }, [] )
     
    return (
        <div>

            <h1>CRUD</h1>
            <p>Aprendendo a fazer CRUD no react</p>

            <hr/>

            <input value={nome} onChange={ e => setNome(e.target.value)} placeholder="Digite o nome..." />
            <br/>
            <input value={idade} onChange={ e => setIdade(e.target.value)}  placeholder="Digite a idade..."/>
            <br/>
            <button onClick={salvar}>Salvar</button>
            {
                estaEditando != -1 && <button onClick={cancelarEdicao}>Cancelar</button>
            }

            <hr/>

            <table border="">
            
                <tr>
                    <td>ID</td>
                    <td>nome</td>
                    <td>Idade</td>   
                    <td>Ações</td>                           
                </tr> 
                 {
                    usuarios.map(
                        i =>
                            <tr>
                                <td>{i.id}</td>
                                <td>{i.nome}</td>
                                <td>{i.idade}</td>   
                                <td>
                                    <button onClick={()=>editar(i.id)}>✒️ alterar</button>
                                    <button onClick={()=>remover(i.id)}>🗑️ excluir</button>
                                </td>                           
                        </tr>  
                    )
                 }

                  
            </table>
        </div>
    )
}

export default App
