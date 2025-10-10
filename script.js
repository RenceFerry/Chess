import { white, black } from "./chessPieces.js"

const chess_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - n n"
let chess_fen_undo = [chess_fen]
let undoTracker = 0
const chessBoard = document.querySelector(".chess-board")
const undo = document.querySelector(".undo")
const redo = document.querySelector(".redo")
const newGameBtn = document.querySelector(".new-game")
const section = document.querySelector("section")
let winnerDiv
let undoRedo = false
let squares
const fileAlp = ["a", "b", "c", 'd', 'e', 'f', 'g', 'h']
const container = document.querySelector(".container")
let temp = Array(8).fill(null).map(()=>Array(8).fill(null))
let Board

class Game{
  constructor(chessDetails){
    this.chessDetails = chessDetails
  }
  isWhite(id){return id === id.toUpperCase()}
  inBounds(r,c){return r>=0&&r<=7&&c>=0&&c<=7}
  
  setUp(){
    const parts = this.chessDetails.split(" ")
    this.board = Array(8).fill(null).map(()=>Array(8).fill(null))
    this.turn = parts[1]
    const row = parts[0].split('/')
    this.enp = parts[3]==='-'?'':parts[3]
    this.castle = parts[2]==='n'?null:parts[2].split('')
    this.check = parts[4]==='n'?'n':parts[4]
    
    let prevMove = parts[5]==='n'?'n':parts[5].split('/')
    if(prevMove!=='n'){
      prevMove = prevMove.map(move=>{
        move = move.split('')
        move = move.map(Number)
        return move
      })
    }
    //)
    
    this.prevMove = prevMove
    
    for(let r = 0; r < 8; r++){
      let file = 0
      for(const ch of row[r]){
        if(/[1-8]/.test(ch)){ file += parseInt(ch); }
        else{ this.board[r][file] = ch; file++; }
      }
    }
    
    generateBoard()
    render(this.board)
  }
  
  generateMoves(id){
    let moves = []
    const r = id[0]
    const c = id[1]
    
    let p = this.board[r][c]
    if(!p)return
    if(((this.turn === 'w') !== this.isWhite(p)))return
    p = p.toLowerCase()
    if(p==='p')this.genPawnMoves(r,c,moves, this.board)
    if(p==='r')this.genSlidingMoves(r,c,moves,[[0,1],[0,-1],[1,0],[-1,0]], this.board)
    if(p==='n')this.genKnightMoves(r,c,moves, this.board)
    if(p==='b')this.genSlidingMoves(r,c,moves,[[1,1],[1,-1],[-1,1],[-1,-1]], this.board)
    if(p==='q')this.genSlidingMoves(r,c,moves,[[1,1],[1,-1],[-1,1],[-1,-1],[0,1],[0,-1],[1,0],[-1,0]], this.board)
    if(p==='k')this.genKingMoves(r,c,moves, this.board)
    
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
      
   
      let isCheck = this.isCheck(temp, this.turn)

      if(!isCheck)allowedMoves.push(moves[i])
    }
    
    return allowedMoves
  }
  
  makeTempMove(move) {
    const board = this.board;
    temp = structuredClone(board);

    let from = move.from;
    let to = move.to;
    let p = move.p;
  
    temp[from[0]][from[1]] = null;
    temp[to[0]][to[1]] = p;
  }

  isCheck(board, color){
    let enemy = color==='w'?'b':'w'
    let moves = this.genPseudoMoves(board, enemy)
    const kingPos = this.findKing(color, board)
    
    for(let i=0;i<moves.length;i++){
      if(moves[i].to.join()===kingPos.join()){
        return true
      }
    }
    
    return false
  }
  
  genPseudoMoves(board, color){
    let moves = []
    for(let r = 0; r<8;r++){
      for(let c=0;c<8;c++){
        let p = board[r][c]
        if(!p)continue
        
        if((color === 'w') !== this.isWhite(p))continue
  
        p = p.toLowerCase()
        if(p==='p')this.genPawnMoves(r,c,moves, board)
        if(p==='r')this.genSlidingMoves(r,c,moves,[[0,1],[0,-1],[1,0],[-1,0]], board)
        if(p==='n')this.genKnightMoves(r,c,moves, board)
        if(p==='b')this.genSlidingMoves(r,c,moves,[[1,1],[1,-1],[-1,1],[-1,-1]], board)
        if(p==='q')this.genSlidingMoves(r,c,moves,[[1,1],[1,-1],[-1,1],[-1,-1],[0,1],[0,-1],[1,0],[-1,0]], board)
        if(p==='k')this.genKingMoves(r,c,moves, board)
      }
    }
    
    return moves
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

  let checkSq
  if(Board.check==='n'){
    checkSq = chessBoard.querySelector(".check")
    if(checkSq){
      checkSq.classList.remove("check")
    }
  }else if(Board.check==='w'){
    const sqPosW = Board.findKing('w', Board.board).join('')
    checkSq = document.getElementById(sqPosW)
    checkSq.classList.add("check")
    
    const sqPosB = Board.findKing('b', Board.board).join('')
    checkSq = document.getElementById(sqPosB)
    checkSq.classList.remove("check")
  }else if(Board.check==='b'){
    
    const sqPosW = Board.findKing('w', Board.board).join('')
    checkSq = document.getElementById(sqPosW)
    checkSq.classList.remove("check")
    
    const sqPosB = Board.findKing('b', Board.board).join('')
    checkSq = document.getElementById(sqPosB)
    checkSq.classList.add("check")
  }
  
  const highlight = chessBoard.querySelectorAll(".highlight")
  if(highlight){
    highlight.forEach(h=>h.classList.remove("highlight"))
  }
  
  if(Board.prevMove!=='n'){
    highlightPrevMove(Board.prevMove[0], Board.prevMove[1])
  }else{
    const prevSquares = chessBoard.querySelectorAll(".prev-move")
    if(prevSquares.length!=0){
      
      prevSquares.forEach(s=>s.classList.remove("prev-move"))
    }
  }
  
  mate()
}

function addEvents(){
  squares.forEach(s=>{
    s.onclick = (e)=>{
      if(!e.currentTarget.hasChildNodes()&&!e.currentTarget.classList.contains("allowed")){
        removeDivAllowed()
      }
      move(s)
    }
  })
  redo.addEventListener("click",()=>UnReDo("redo"))
  undo.addEventListener("click",()=>UnReDo("undo"))
  newGameBtn.addEventListener("click",()=>newGame())
  
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
  const move = [Number(square.id[0]),Number(square.id[1])]
  const moves = Board.moves
  let p
  let to
  let from
  
  if(undoRedo&&undoTracker!==0){
    chess_fen_undo.splice(-1*undoTracker)
    undoTracker=0
    undoRedo=false
  }
  
  const highlight = chessBoard.querySelectorAll(".highlight")
  if(highlight){
    highlight.forEach(h=>h.classList.remove("highlight"))
  }
  if(square.hasChildNodes())square.classList.add("highlight")
  
  if(square.classList.contains("allowed")){
    
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
          
        }else if(p.toLowerCase()==='k'&&Board.castle){
          let newCastle = Board.castle.filter(c=>Board.isWhite(c)!== Board.isWhite(p))
          Board.castle = newCastle
          
        }
        
        
    
        Board.board[to[0]][to[1]] = p
        Board.board[from[0]][from[1]] = null
        
        //check if rook and toggle castle
        if(p.toLowerCase()==='r' && Board.castle){
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
  
    let prevColor = Board.turn
    Board.turn = Board.turn === 'w'?'b':'w'
    Board.prevMove = [to, from]
    
    if(Board.isCheck(Board.board, Board.turn))check(Board.turn, true, from,p)
    else {
      check(prevColor, false, from,p)
    }
    if(p.toLowerCase()==='k')check(prevColor, false, from, p)
    
    render(Board.board)
    removeDivAllowed()
  
    setFen()
    //mate()
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
      Board.prevMove = [to, from]
      Board.board[to[0]][to[1]] = p
      Board.board[from[0]][from[1]] = null
      setFen()
      
      if(Board.isCheck(Board.board, Board.turn))check(Board.turn, true, from,p)
      else {
        check(prevColor, false, from,p)
      }
      
      render(Board.board)
      removeDivAllowed()
    }
  }
}

function check(color, ischeck, from, p){
  if(ischeck){
    Board.check = color==='w'?'w':'b'
  }else if(color===Board.check){
    Board.check = 'n'
  }
  
}

function highlightPrevMove(to, from){
  const prevSquares = chessBoard.querySelectorAll(".prev-move")
  if(prevSquares.length!=0){
    prevSquares.forEach(s=>s.classList.remove("prev-move"))
  }
  
  to = String(to.join(''))
  from = String(from.join(''))
  
  const fromSquare = document.getElementById(from)
  const toSquare = document.getElementById(to)
  
  fromSquare.classList.add("prev-move")
  toSquare.classList.add("prev-move")
}

function setFen(){
  let fen_array = []
  let boardRow = []
  let check = Board.check
  let enp = Board.enp===''?'-':Board.enp
  let castle = Board.castle.length===0?'n':Board.castle.join('')
  let prevMove = Board.prevMove
  
  prevMove = prevMove.map(move=>String(move.join('')))
  
  for(let i=0;i<8;i++){
    let row = []
    let nullNum = 0
    for(let j=0;j<8;j++){
      if(Board.board[i][j]){
        if(nullNum!==0){
          row.push(nullNum)
          nullNum=0
        }
        row.push(Board.board[i][j])
      }else if(j===7&&nullNum!==0){
        nullNum++
        row.push(nullNum)
      }else{
        nullNum++
      }
    }
    
    
    boardRow.push(row.join(''))
    
  }
  const row = boardRow.join('/')
  
  fen_array.push(row, Board.turn, castle, enp, check, prevMove.join('/'))
  
  chess_fen_undo.push(fen_array.join(' '))
}

function mate(){
  let moves = Board.genPseudoMoves(Board.board, Board.turn)
  moves = Board.filterMoves(moves)
  
  console.log(moves, Board.turn)
  if(moves.length===0){
    //console.log("mate", Board.turn)
    chessBoard.style.pointerEvents = "none"
    winnerDiv = document.createElement("div")
    
    let winnerColor = Board.turn==='w'?'b':'w'
    winnerDiv.classList.add("winner")
    winnerDiv.classList.add(winnerColor)
    
    winnerDiv.innerHTML = `${winnerColor==='w'?white[4].value:black[4].value}  Wins!!`
    
    section.appendChild(winnerDiv)
    
    winnerDiv.onclick = ()=>winnerDiv.remove()
  }
}

function UnReDo(unRedo){
  switch(unRedo){
    case "undo":
      undoTracker++
      if(undoTracker>chess_fen_undo.length-1){
        undoTracker--
        break
      }
      Board = new Game(chess_fen_undo[(chess_fen_undo.length-1) - undoTracker])
      Board.setUp()
      removeDivAllowed()
      undoRedo = true
      break
    case "redo":
      undoTracker--
      if(undoTracker<0){
        undoTracker++
        break
      }
      Board = new Game(chess_fen_undo[(chess_fen_undo.length-1) - undoTracker])
      Board.setUp()
      removeDivAllowed()
      undoRedo = true
      break
  }
  
}

function newGame(){
  Board = new Game(chess_fen)
  Board.setUp()
  chess_fen_undo = [chess_fen]
  chessBoard.style.pointerEvents = "auto"
  if(winnerDiv)winnerDiv.remove()
  removeDivAllowed()
}

window.addEventListener("beforeunload", () => {
  // Save instantly to localStorage
  localStorage.setItem("fen", JSON.stringify(chess_fen_undo));
});

window.addEventListener("load", () => {
  const saved = localStorage.getItem("fen");
  if (saved) {
    chess_fen_undo = JSON.parse(saved);
    //console.log("Restored moves:", chess_fen_undo.at(-1));
    Board = new Game(chess_fen_undo.at(-1))
    Board.setUp()
  }else{
    Board = new Game(chess_fen)
    Board.setUp()
  }
  addEvents()
  removeDivAllowed()
});


//console.log(localStorage)

