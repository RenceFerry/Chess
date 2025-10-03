import { white, black } from "./chessPieces.js"

let chessDetails = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -"
const chessBoard = document.querySelector(".chess-board")
let squares
const fileAlp = ["a", "b", "c", 'd', 'e', 'f', 'g', 'h']
const container = document.querySelector(".container")

class Game{
  constructor(chessDetails){
    this.chessDetails = chessDetails
  }
  isWhite(id){return id === id.toUpperCase()}
  inBounds(r,c){return r>=0&&r<=7&&c>=0&&c<=7}
  
  setUp(){
    const parts = chessDetails.split(" ")
    this.board = Array(8).fill(null).map(()=>Array(8).fill(null))
    this.turn = parts[1]
    const row = parts[0].split('/')
    this.enp = parts[3]==='-'?'':parts[3]
    
    for(let r = 0; r < 8; r++){
      let file = 0
      for(const ch of row[r]){
        if(/[1-8]/.test(ch)){ file += parseInt(ch); }
        else{ this.board[r][file] = ch; file++; }
      }
    }
    
    
    
    generateBoard()
    render(this.board)
    addEvents(this)
  }
  
  generateMoves(id){
    let moves = []
    const r = Number(id[0])
    const c = Number(id[1])
    
    let p = this.board[r][c]
    if((this.turn === 'w') !== this.isWhite(p))return
    p = p.toLowerCase()
    if(p==='p')this.genPawnMoves(r,c,moves)
    if(p==='r')this.genSlidingMoves(r,c,moves,[[0,1],[0,-1],[1,0],[-1,0]])
    if(p==='n')this.genKnightMoves(r,c,moves)
    if(p==='b')this.genSlidingMoves(r,c,moves,[[1,1],[1,-1],[-1,1],[-1,-1]])
    if(p==='q')this.genSlidingMoves(r,c,moves,[[1,1],[1,-1],[-1,1],[-1,-1],[0,1],[0,-1],[1,0],[-1,0]])
    if(p==='k')this.genKingMoves(r,c,moves)
    
    
//     for(let r = 0; r<8;r++){
//       for(let c=0;c<8;c++){
//         let p = this.board[r][c]
//         if(!p)continue
//         
//         if((this.turn === 'w') !== this.isWhite(p))continue
//         p = p.toLowerCase()
//         if(p==='p')this.genPawnMoves(r,c,moves)
//         if(p==='r')this.genSlidingMoves(r,c,moves,[[0,1],[0,-1],[1,0],[-1,0]])
//         if(p==='n')this.genKnightMoves(r,c,moves)
//         if(p==='b')this.genSlidingMoves(r,c,moves,[[1,1],[1,-1],[-1,1],[-1,-1]])
//         if(p==='q')this.genSlidingMoves(r,c,moves,[[1,1],[1,-1],[-1,1],[-1,-1],[0,1],[0,-1],[1,0],[-1,0]])
//         if(p==='k')this.genKingMoves(r,c,moves)
//       }
//     }
    
    
    this.moves = moves
    return(moves)
  }
  
  genPawnMoves(r,c,moves){
    const p = this.board[r][c]
    const dir = this.turn === 'w'?-1:1
    const startMove = r===6||r===1?true:false
    
    //check if start pos
    if(this.inBounds(r+(2*dir),c) && startMove){
      
      if(!this.board[r+(2*dir)][c] &&
      !this.board[r+dir][c]
      ){
        moves.push({from: [r,c], to: [r+(2*dir), c], p:p, enp: `${this.isWhite(p)?fileAlp[c].toUpperCase():fileAlp[c]}`})
      }
    }
    
    if(this.inBounds(r+dir, c)){
      //promote
      if(((r===1&&this.isWhite(p))||(r===6&&!this.isWhite(p))) && !this.board[r+dir][c]){
        moves.push({from: [r,c], to: [r+dir, c], p:p,enp:null, promote: true})
      }
      //regular move
      else if(!this.board[r+dir][c]){
        moves.push({from: [r,c], to: [r+dir, c], p:p, enp:null})
      }
    }
    
    
    
    //capture
    if(this.board[r+dir][c+1] && (this.isWhite(p)!==this.isWhite(this.board[r+dir][c+1]))
    ){
      if(r===1||r===6){
        moves.push({from: [r,c], to: [r+dir, c+1], p:p,enp:null, promote: true})
      }else{
        moves.push({from: [r,c], to: [r+dir, c+1], p:p,enp:null})
      }
    }
    
    if(this.board[r+dir][c-1] && (this.isWhite(p)!==this.isWhite(this.board[r+dir][c-1]))
    ){
      if(r===1||r===6){
        moves.push({from: [r,c], to: [r+dir, c-1], p:p,enp:null, promote: true})
      }else{
        moves.push({from: [r,c], to: [r+dir, c-1], p:p, enp:null})
      }
    }
    
    //enpasand
    if(this.enp!==''){
      if(this.board[r][c+1]){
        
        if((this.isWhite(this.board[r][c+1])!==this.isWhite(p)) &&
        this.board[r][c+1].toLowerCase() === 'p' &&
        c+1 === fileAlp.indexOf(this.enp.toLowerCase())
        ){
          moves.push({from: [r,c], to: [r+dir, c+1], p:p, enp:null, enpCaptured:[r,c+1]})
        }
      }
      
      else if(this.board[r][c-1]){
        if(this.isWhite(this.board[r][c-1])!==this.isWhite(p) &&
        this.board[r][c-1].toLowerCase() === 'p' &&
        c-1 === fileAlp.indexOf(this.enp.toLowerCase())
        ){
          moves.push({from: [r,c], to: [r+dir, c+1], p:p, enp:null, enpCaptured:[r,c-1]})
        }
      }
    }
  }
  
  genSlidingMoves(){}
  
  genKnightMoves(){}
  
  genKingMoves(){}
}

const Board = new Game(chessDetails)
Board.setUp()

function generateBoard(){
  for(let i = 0; i < 8; i++){
    for(let j = 0; j < 8; j++){
      const div = document.createElement("div")
      if((i%2===0 && j%2===0) || (i%2!==0 && j%2!==0)){
        div.classList.add("light") 
      }else{
        div.classList.add("dark")
      }
      
      div.id = `${i}${j}`
      chessBoard.appendChild(div)
    }
  }
  squares = chessBoard.querySelectorAll("div")
}

function render(board){
  let pos = 0
  
  for(let i = 0; i < 8; i++){
    for(let j = 0; j < 8; j++){
      const div = squares[pos]
      
      if(!(board[i][j])){div.innerHTML='';pos++;continue}
      
      switch(board[i][j]){
        case "r":
          div.innerHTML = black[0].value
          break
        case "n":
          div.innerHTML = black[1].value
          break
        case "b":
          div.innerHTML = black[2].value
          break
        case "k":
          div.innerHTML = black[3].value
          break
        case "q":
          div.innerHTML = black[4].value
          break
        case "p":
          div.innerHTML = black[5].value
          break
        case "R":
          div.innerHTML = white[0].value
          break
        case "N":
          div.innerHTML = white[1].value
          break
        case "B":
          div.innerHTML = white[2].value
          break
        case "Q":
          div.innerHTML = white[3].value
          break
        case "K":
          div.innerHTML = white[4].value
          break
        case "P":
          div.innerHTML = white[5].value
          break
      }
      
      pos++
    }
  }
  
  const pieces = chessBoard.querySelectorAll("div > svg")
  
  pieces.forEach(piece=>{
    piece.onclick = ()=>makeMove(piece)
    piece.style.rotate = `${Board.turn === 'w'?0:180}deg`
  })
  
}

function addEvents(){
  squares.forEach(s=>{
    s.onclick = ()=>move(s)
  })
}

function makeMove(piece, moves){
  moves = Board.generateMoves(piece.parentElement.id)
  removeDivAllowed()

  moves.forEach((m)=>{
    const move = String(m.to.join(''))
    
    const square = document.getElementById(move)
    square.classList.add("allowed")
  })
}

function removeDivAllowed(){
  if(chessBoard.querySelectorAll(".allowed").length!==0){
    const allowed = chessBoard.querySelectorAll(".allowed")
    allowed.forEach(p=>{
      p.classList.remove("allowed")
    })
  }
}

function move(square){
  if(square.classList.contains("allowed")){
    const move = [Number(square.id[0]),Number(square.id[1])]
    const moves = Board.moves
    
    for(let i=0; i<moves.length;i++){
      if(moves[i].to.join()==move.join()){
        let nextPos = moves[i].p
        Board.board[moves[i].from[0]][moves[i].from[1]] = null
        
        //check if pawn start move and set enp
        if(moves[i].enp){
          Board.enp = moves[i].enp
        }else{
          Board.enp = ''
        }
        
        //if enpassant capture
        if(moves[i].enpCaptured){
          Board.board[moves[i].enpCaptured[0]][moves[i].enpCaptured[1]] = null
        }
        
        //if promoting pawn
        if(moves[i].promote){
          promote(Board.turn, move)
          return
        }
        
        Board.board[move[0]][move[1]] = nextPos
      }
    }
  
    //console.log(board.board)
    Board.turn = Board.turn === 'w'?'b':'w'
    render(Board.board)
    removeDivAllowed()
  }
}

function promote(turn, to){
  const officials = ['r', 'n', 'b', 'q']
  chessBoard.style.pointerEvents = "none"
  const proDiv = document.createElement("div")
  proDiv.classList.add("promote")
  proDiv.innerHTML = `${turn==='w'?`${white[0].value}${white[1].value}${white[2].value}${white[4].value}`:`${black[0].value}${black[1].value}${black[2].value}${black[4].value}`}`
  proDiv.style.background = `${turn==='w'?"#b58863":"#e8cda1"}`
  proDiv.style.top = `${turn==='w'?"4%":"84%"}`
  proDiv.style.rotate = `${turn==='w'?"0":"180"}deg`
  
  container.appendChild(proDiv)
  const svgs = proDiv.querySelectorAll("svg")
  
  for(let i = 0;i < 4;i++){
    let p
    svgs[i].onclick = ()=>{
      p = turn==='w'?officials[i].toUpperCase():officials[i]
      proDiv.remove()
      chessBoard.style.pointerEvents = "auto"
      
      Board.board[to[0]][to[1]] = p
      Board.turn = turn === 'w'?'b':'w'
      render(Board.board)
      removeDivAllowed()
      console.log(Board.board)
    }
  }
}

