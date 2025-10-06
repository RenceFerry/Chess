import { white, black } from "./chessPieces.js"

let chessDetails = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - n"
const chessBoard = document.querySelector(".chess-board")
let squares
const fileAlp = ["a", "b", "c", 'd', 'e', 'f', 'g', 'h']
const container = document.querySelector(".container")
let temp = Array(8).fill(null).map(()=>Array(8).fill(null))

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
    this.castle = parts[2]==='n'?null:parts[2].split('')
    this.check = parts[4]==='n'?null:parts[4]
    
    
    
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
    const r = id[0]
    const c = id[1]
    
    let p = this.board[r][c]
    if(((this.turn === 'w') !== this.isWhite(p)))return
    p = p.toLowerCase()
    if(p==='p')this.genPawnMoves(r,c,moves, this.board)
    if(p==='r')this.genSlidingMoves(r,c,moves,[[0,1],[0,-1],[1,0],[-1,0]], this.board)
    if(p==='n')this.genKnightMoves(r,c,moves, this.board)
    if(p==='b')this.genSlidingMoves(r,c,moves,[[1,1],[1,-1],[-1,1],[-1,-1]], this.board)
    if(p==='q')this.genSlidingMoves(r,c,moves,[[1,1],[1,-1],[-1,1],[-1,-1],[0,1],[0,-1],[1,0],[-1,0]], this.board)
    if(p==='k')this.genKingMoves(r,c,moves, this.board)
    
    
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
    //console.log(this.board)

    if(moves.length===0){
      return moves
    }else{
      let allowedMoves = this.filterMoves(moves)
      
      
      this.moves = allowedMoves
      return(allowedMoves)
      
    }
  }
  
  filterMoves(moves){
    let allowedMoves = []
    
    for(let i=0;i<moves.length;i++){
      this.makeTempMove(moves[i])
      
      //console.log(temp, moves[i], this.board)
      let isCheck = this.isCheck(temp, this.turn)
      //console.log(isCheck)
      if(!isCheck)allowedMoves.push(moves[i])
    }
    
    return allowedMoves
  }
  
  makeTempMove(move) {
    const board = this.board;
    temp = structuredClone(board);
  
    //console.log(temp)
  
    let from = move.from;
    let to = move.to;
    let p = move.p;
  
    temp[from[0]][from[1]] = null;
    temp[to[0]][to[1]] = p;
  }

  isCheck(board, color){
    let moves = []
    const kingPos = this.findKing(color, board)
    
    for(let r = 0; r<8;r++){
      for(let c=0;c<8;c++){
        let p = board[r][c]
        if(!p)continue
        
        if((color === 'w') === this.isWhite(p))continue
        //console.log(p)
        p = p.toLowerCase()
        if(p==='p')this.genPawnMoves(r,c,moves, board)
        if(p==='r')this.genSlidingMoves(r,c,moves,[[0,1],[0,-1],[1,0],[-1,0]], board)
        if(p==='n')this.genKnightMoves(r,c,moves, board)
        if(p==='b')this.genSlidingMoves(r,c,moves,[[1,1],[1,-1],[-1,1],[-1,-1]], board)
        if(p==='q')this.genSlidingMoves(r,c,moves,[[1,1],[1,-1],[-1,1],[-1,-1],[0,1],[0,-1],[1,0],[-1,0]], board)
        if(p==='k')this.genKingMoves(r,c,moves, board)
      }
    }
    
    //console.log(moves)
    
    for(let i=0;i<moves.length;i++){
      if(moves[i].to.join()===kingPos.join()){
        return true
      }
    }
    
    //console.log(this.board, this.tempBoard)
    
    
    return false
  }
  
  genPawnMoves(r,c,moves, board){
    const p = board[r][c]
    let dir = this.isWhite(p)?-1:1
    const startMove = r===6||r===1?true:false
    
    //check if start pos
    if(this.inBounds(r+(2*dir),c) && startMove){
      
      if(!board[r+(2*dir)][c] &&
      !board[r+dir][c]
      ){
        moves.push({from: [r,c], to: [r+(2*dir), c], p:p, enp: `${this.isWhite(p)?fileAlp[c].toUpperCase():fileAlp[c]}`})
      }
    }
    
    if(this.inBounds(r+dir, c)){
      //promote
      if(((r===1&&this.isWhite(p))||(r===6&&!this.isWhite(p))) && !board[r+dir][c]){
        moves.push({from: [r,c], to: [r+dir, c], p:p, promote: true})
      }
      //regular move
      else if(!board[r+dir][c]){
        moves.push({from: [r,c], to: [r+dir, c], p:p })
      }
    }
    
    
    
    //capture
    if(board[r+dir][c+1] && (this.isWhite(p)!==this.isWhite(board[r+dir][c+1]))
    ){
      if((r===1&&this.isWhite(p))||(r===6&&!this.isWhite(p))){
        moves.push({from: [r,c], to: [r+dir, c+1], p:p, promote: true})
      }else{
        moves.push({from: [r,c], to: [r+dir, c+1], p:p,})
      }
    }
    
    if(board[r+dir][c-1] && (this.isWhite(p)!==this.isWhite(board[r+dir][c-1]))
    ){
      if((r===1&&this.isWhite(p))||(r===6&&!this.isWhite(p))){
        moves.push({from: [r,c], to: [r+dir, c-1], p:p, promote: true})
      }else{
        moves.push({from: [r,c], to: [r+dir, c-1], p:p, })
      }
    }
    
    //enpasand
    if(this.enp!==''){
      //console.log(this.enp)
      if(board[r][c+1]){
        
        if((this.isWhite(board[r][c+1])!==this.isWhite(p)) &&
        board[r][c+1].toLowerCase() === 'p' &&
        c+1 === fileAlp.indexOf(this.enp.toLowerCase())
        ){
          moves.push({from: [r,c], to: [r+dir, c+1], p:p, enpCaptured:[r,c+1]})
        }
      }
      
      if(board[r][c-1]){
        if(this.isWhite(board[r][c-1])!==this.isWhite(p) &&
        board[r][c-1].toLowerCase() === 'p' &&
        c-1 === fileAlp.indexOf(this.enp.toLowerCase())
        ){
          moves.push({from: [r,c], to: [r+dir, c-1], p:p, enpCaptured:[r,c-1]})
        }
      }
    }
  }
  
  genSlidingMoves(r,c,moves,deltas, board){
    const p = board[r][c]
    let rr = r
    let cc = c
    
    deltas.forEach(delta=>{
      rr=r
      cc=c
      while(this.inBounds(rr,cc)){
        rr+=delta[0]
        cc+=delta[1]
        if(!this.inBounds(rr,cc))break
        
        if(!board[rr][cc]){
          moves.push({from: [r,c], to: [rr,cc], p:p})
        }
        else if(board[rr][cc]&&
        (this.isWhite(board[rr][cc])!==this.isWhite(p))
        ){
          moves.push({from: [r,c], to: [rr,cc], p:p})
          break
        }
        else break
      }
    })
  }
  
  genKnightMoves(r,c,moves,board){
    const deltas = [[2,-1],[2,1],[-2,-1],[-2,1],[1,2],[1,-2],[-1,2],[-1,-2]]
    const p = board[r][c]
    
    deltas.forEach(delta=>{
      let rr = r+delta[0]
      let cc = c+delta[1]
      
      if(!this.inBounds(rr,cc))return
      
      if(!board[rr][cc]){
        moves.push({from: [r,c], to: [rr,cc], p:p})
      }
      else if(board[rr][cc]&&
      (this.isWhite(board[rr][cc])!==this.isWhite(p))
      ){
        moves.push({from: [r,c], to: [rr,cc], p:p})
      }
    })
    
  }
  
  genKingMoves(r,c,moves, board){
    const p = board[r][c]
    let rr = r
    let cc = c
    
    for(let i = -1; i <= 1;i++){
      rr=r
      rr+=i
      for(let j = -1; j <= 1;j++){
        cc=c
        cc+=j
        
        if(!this.inBounds(rr,cc))continue
        
        if(!board[rr][cc]){
          moves.push({from: [r,c], to: [rr,cc], p:p})
        }
        else if(board[rr][cc]&&
        (this.isWhite(board[rr][cc])!==this.isWhite(p))
        ){
          moves.push({from: [r,c], to: [rr,cc], p:p})
        }
      }
    }
    
    //check for castling
    //console.log(this.castle)
    if(this.castle){
      this.castle.forEach(castle=>{
        if(this.isWhite(p)!==this.isWhite(castle))return
        let delta
        let cas = castle.toLowerCase()
        
        if(cas==='q'){
          delta = -1
        }else{
          delta = 1
        }
        cc=c
        
        while(this.inBounds(r,cc)){
          cc+=delta
          if(!this.inBounds(r,cc))break
          if(!board[r][cc])continue 
          
          if(board[r][cc]&&!(cc===0||cc===7))break
          //console.log(r,cc)
          if(board[r][cc].toLowerCase()==='r'&&cas==='q'){
            moves.push({to:[r,c-2],
            from:[r,c],
            rto:[r,c-1],
            rfrom:[r,cc],
            p:p,
            r:board[r][cc],
            castle:castle})
          }
          if(board[r][cc].toLowerCase()==='r'&&cas==='k'){
            moves.push({to:[r,c+2],
            from:[r,c],
            rto:[r,c+1],
            rfrom:[r,cc],
            p:p,
            r:board[r][cc],
            castle:castle
            })
          }
        }
        
      })
    }
    
    
  }
  
  findKing(color, board){
    let king = color==='w'?'K':'k'
    
    for(let i = 0; i<8;i++){
      for(let j=0;j<8;j++){
        if(board[i][j]===king)return[i,j]
      }
    }
  }
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
          div.innerHTML = black[4].value
          break
        case "q":
          div.innerHTML = black[3].value
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

function makeMove(piece){
  const id = [Number(piece.parentElement.id[0]),Number(piece.parentElement.id[1])]
  const moves = Board.generateMoves(id)
  removeDivAllowed()
  
  if(!moves||moves.length===0)return

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
    let p
    let to
    let from
    
    for(let i=0; i<moves.length;i++){
      if(moves[i].to.join()==move.join()){
        p = moves[i].p
        to = moves[i].to
        from = moves[i].from
        
        
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
          promote(Board.turn, move, from)
          return
        }
        
        //cjeck for castling
        if(moves[i].castle){
          let rfrom = moves[i].rfrom
          let rto = moves[i].rto
          let r = moves[i].r
          let castle = moves[i].castle
          
          Board.board[rfrom[0]][rfrom[1]] = null
          Board.board[rto[0]][rto[1]] = r
          let newCastle = Board.castle.filter(c=>Board.isWhite(c)!== Board.isWhite(p))
          Board.castle = newCastle
          
        }else if(p.toLowerCase()==='k'){
          let newCastle = Board.castle.filter(c=>Board.isWhite(c)!== Board.isWhite(p))
          Board.castle = newCastle
          
        }
        
        Board.board[to[0]][to[1]] = p
        Board.board[from[0]][from[1]] = null
        
        //check if rook and toggle castle
        if(Board.castle.length===0)break
        if(p.toLowerCase()==='r'){
          if(from[1]===0){
            let newCastle = Board.castle.filter(c=>{
              return !(c.toLowerCase()==='q' &&  Board.isWhite(c) === Board.isWhite(p))
            })
            Board.castle = newCastle
            
          }
          if(from[1]===7){
            let newCastle = Board.castle.filter(c=>{
              return !(c.toLowerCase()==='k' &&  Board.isWhite(c) === Board.isWhite(p))
            })
            Board.castle = newCastle
            
          }
        }
        
      }
    }
  
    
    //console.log(Board.board, temp)
    let prevColor = Board.turn
    Board.turn = Board.turn === 'w'?'b':'w'
    render(Board.board)
    removeDivAllowed()
    
    if(Board.isCheck(Board.board, Board.turn))check(Board.turn, true, from,p)
    else check(Board.turn, false, from,p)
    
    check(prevColor, false, from, p)
  }
}

function promote(turn, to, from){
  const officials = ['r', 'n', 'b', 'q']
  chessBoard.style.pointerEvents = "none"
  const proDiv = document.createElement("div")
  proDiv.classList.add("promote")
  proDiv.innerHTML = `${turn==='w'?`${white[0].value}${white[1].value}${white[2].value}${white[3].value}`:`${black[0].value}${black[1].value}${black[2].value}${black[3].value}`}`
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
      
      let prevColor = Board.turn
      Board.turn = turn === 'w'?'b':'w'
      Board.board[to[0]][to[1]] = p
      Board.board[from[0]][from[1]] = null
      render(Board.board)
      removeDivAllowed()
      
      if(Board.isCheck(Board.board, Board.turn))check(Board.turn, true)
      else check(Board.turn, false)
      if(Board.isCheck(Board.board, prevColor))check(prevColor, true)
      else check(prevColor, false)
    }
  }
}

function check(color, ischeck, from, p){
  let squarePos
  if(p.toLowerCase()==='k'){
    squarePos = String(from.join(''))
  }
  else squarePos = String(Board.findKing(color, Board.board).join(''))
  let square = document.getElementById(squarePos)
  console.log(squarePos, color, ischeck)
  
  if(ischeck){
    Board.check = color==='w'?'K':'k'
    
    square.classList.add("check")
  }else{
    Board.check = null
    
    square.classList.remove("check")
  }
}

console.log(localStorage)