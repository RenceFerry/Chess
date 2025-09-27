import { white, black } from "./chessPieces.js"

const chessBoard = document.querySelector(".chess-board")
const positions = chessBoard.querySelectorAll(".position")
let positionsIndx = 0
let colorPlay
let blkPawn = []
let blkRok = []
let blkKngt = []
let blkBish = []
let blkQuen = [];
let blkKing;
let whtPawn = []
let whtRok = []
let whtKngt = []
let whtBish = []
let whtQuen = [];
let whtKing

for(let i = 1; i < 9; i++){
  for(let j = 1; j < 9; j++){
    positions[positionsIndx].id = `${i}${j}`
    positionsIndx++
  }
}

class Piece{
  constructor({key, id, pos, svg}){
    this.key = key
    this.id = id
    this.pos = pos
    this.svg = svg
    this.div
    this.bindMove = this.move.bind(this)
  }
  
  addToBoard(){
    const position = document.getElementById(this.pos)
    this.div = document.createElement("div")
    this.div.id = this.id
    this.div.innerHTML = this.svg
    position.append(this.div)
    position.classList.add(this.key)
    
    this.events()
  }
  
  setLegal(legal){
    this.removeAllowed()
    
    legal.forEach(l=>{
      const pos = document.getElementById(l)
      pos.classList.add("allowed")
      pos.onclick = this.bindMove
    })
  }
  
  removeAllowed(){
    try{
      const allowedPos = document.querySelectorAll(".allowed")
      allowedPos.forEach(pos=>{
        pos.classList.remove("allowed")
      })
    }catch(e){}
  }
  
  move(event){
    if(event.currentTarget.classList.contains("allowed")){
      this.div.parentElement.classList.remove(this.key)
      event.currentTarget.innerHTML = ''
      event.currentTarget.classList.remove(`${this.key=="white"?"black":"white"}`)
      event.currentTarget.classList.add(this.key)
      this.div.remove()
      event.currentTarget.appendChild(this.div)
      this.pos = event.currentTarget.id
      
      colorPlay = colorPlay=="white"?"black":"white"
      const svgDiv = document.querySelectorAll(".position > div")
      svgDiv.forEach(d=>d.style.rotate = `${colorPlay=="white"?'0':"180"}deg`)
      this.removeAllowed()
    }
  }
  
}

class Pawn extends Piece{
  events(){
    this.div.addEventListener("click", () => {
      if(this.key==colorPlay)this.legalMoves()
    })
  }
  
  legalMoves(){
  
    let legal = []
    
    //check color
    if (Number(this.pos[0]<8) && this.key == "white"){
      //initial pos
      if(this.pos[0] == "2"){
        if(document.getElementById(`${(Number(this.pos[0])+2)+this.pos[1]}`).children.length == 0){
          legal.push((Number(this.pos[0])+2)+this.pos[1])
        }
      }
      //check pos
      if(
        document.getElementById(`${(Number(this.pos[0])+1)+this.pos[1]}`).children.length == 0
        ){
        legal.push((Number(this.pos[0])+1)+this.pos[1])
      }
      //check if pawn can eat and not in edge
      if(this.pos[1]!="8"&&this.pos[1]!="1"){
        if(document.getElementById(`${(Number(this.pos[0])+1)+String ((Number(this.pos[1])+1))}`).classList.contains("black")){
          legal.push(
            (Number(this.pos[0])+1)+String((Number(this.pos[1])+1))
          )
        }
        if(document.getElementById(`${(Number(this.pos[0])+1)+String((Number(this.pos[1])-1))}`).classList.contains("black")){
          legal.push(
            (Number(this.pos[0])+1)+String(Number(this.pos[1])-1)
          )         
        }
      }//if pawn can eat and in pos 1 8
      else if(this.pos[1]=="1"){
        if(document.getElementById(`${(Number(this.pos[0])+1)+String(Number(this.pos[1])+1)}`).classList.contains("black")){
          legal.push(
            (Number(this.pos[0])+1)+String(Number(this.pos[1])+1)
          )
        }
      }
      if(this.pos[1]=="8"){
        if(document.getElementById(`${(Number(this.pos[0])+1)+String(Number(this.pos[1])-1)}`).classList.contains("black")){
          legal.push(
            (Number(this.pos[0])+1)+String(Number(this.pos[1])-1)
          )
        }
      }
      
      this.setLegal(legal)
      
    }else if(Number(this.pos[0])>1  && this.key == "black"){
      if(this.pos[0] == "7"){
        if(document.getElementById(`${(Number(this.pos[0])-2)+this.pos[1]}`).children.length == 0){
          legal.push((Number(this.pos[0])-2)+this.pos[1])
        }
      }
      
      if(
        document.getElementById(`${(Number(this.pos[0])-1)+this.pos[1]}`).children.length == 0
        ){
        legal.push((Number(this.pos[0])-1)+this.pos[1])
      }
      //check if pawn can eat and not in edge
      if(this.pos[1]!="8"&&this.pos[1]!="1"){
        if(document.getElementById(`${(Number(this.pos[0])-1)+String ((Number(this.pos[1])-1))}`).classList.contains("white")){
          legal.push(
            (Number(this.pos[0])-1)+String((Number(this.pos[1])-1))
          )
        }
        if(document.getElementById(`${(Number(this.pos[0])-1)+String((Number(this.pos[1])+1))}`).classList.contains("white")){
          legal.push(
            (Number(this.pos[0])-1)+String(Number(this.pos[1])+1)
          )         
        }
      }//if pawn can eat and in pos 1 8
      else if(this.pos[1]=="1"){
        if(document.getElementById(`${(Number(this.pos[0])-1)+String(Number(this.pos[1])+1)}`).classList.contains("white")){
          legal.push(
            (Number(this.pos[0])-1)+String(Number(this.pos[1])+1)
          )
        }
      }
      if(this.pos[1]=="8"){
        if(document.getElementById(`${(Number(this.pos[0])-1)+String(Number(this.pos[1])-1)}`).classList.contains("white")){
          legal.push(
            (Number(this.pos[0])-1)+String(Number(this.pos[1])-1)
          )
        }
      }
      
      this.setLegal(legal)
    }
  }
  
}

class Rook extends Piece{
  events(){
    this.div.addEventListener("click",()=>{
      if(this.key==colorPlay)this.legalMovesRook()
    })
  }
  
  legalMovesRook(){
    let legal = []
    let y = Number(this.pos[0])
    let x = Number(this.pos[1])
    let c = y
    console.log(this.key)
    
    //vertical up
    while(c<8){
      c++
      if(document.getElementById(`${c}${x}`).children.length == 0){
        legal.push(`${c}${x}`)
      }
      else if(document.getElementById(`${c}${x}`).classList.contains("black")){
        if(this.key == "white"){
          legal.push(`${c}${x}`)
          break
        }else{
          break
        }
      }
      else if(document.getElementById(`${c}${x}`).classList.contains("white")){
        if(this.key == "black"){
          legal.push(`${c}${x}`)
          break
        }else{
          break
        }
      }
    }
    //vertical down
    c = y
    while(c>1){
      c--
      if(document.getElementById(`${c}${x}`).children.length == 0){
        legal.push(`${c}${x}`)
      }
      else if(document.getElementById(`${c}${x}`).classList.contains("black")){
        if(this.key == "white"){
          legal.push(`${c}${x}`)
          break
        }else{
          break
        }
      }
      else if(document.getElementById(`${c}${x}`).classList.contains("white")){
        if(this.key == "black"){
          legal.push(`${c}${x}`)
          break
        }else{
          break
        }
      }
      }
    //hori right
    c = x
    while(c<8){
      c++
      if(document.getElementById(`${y}${c}`).children.length == 0){
        legal.push(`${y}${c}`)
      }
      else if(document.getElementById(`${y}${c}`).classList.contains("black")){
        if(this.key == "white"){
          legal.push(`${y}${c}`)
          break
        }else{
          break
        }
      }
      else if(document.getElementById(`${y}${c}`).classList.contains("white")){
        if(this.key == "black"){
          legal.push(`${y}${c}`)
          break
        }else{
          break
        }
      }
    }
    //hori lrft
    c = x
    while(c>1){
      c--
      if(document.getElementById(`${y}${c}`).children.length == 0){
        legal.push(`${y}${c}`)
      }
      else if(document.getElementById(`${y}${c}`).classList.contains("black")){
        if(this.key == "white"){
          legal.push(`${y}${c}`)
          break
        }else{
          break
        }
      }
      else if(document.getElementById(`${y}${c}`).classList.contains("white")){
        if(this.key == "black"){
          legal.push(`${y}${c}`)
          break
        }else{
          break
        }
      }
    }
    
    if(this.id == "wq" || this.id == "bq"){
      return legal
    }else{
      this.setLegal(legal)
    }
  }
}

class Knight extends Piece{
  events(){
    this.div.addEventListener("click",()=>{
      if(this.key==colorPlay)this.legalMoves()
    })
  }
  
  legalMoves(){
    let legal = []
    let x = Number(this.pos[1])
    let y = Number(this.pos[0])
    let posX = x
    let posY = y
    
    //check up legal moves
    posY+= 2
    if(document.getElementById(`${posY}${x}`)){
      //check right up
      posX++
      if(document.getElementById(`${posY}${posX}`)){
        if(
          (document.getElementById(`${posY}${posX}`).classList.contains("black") && this.key == "white") || 
          (document.getElementById(`${posY}${posX}`).classList.contains("white") && this.key == "black")
          ){
          legal.push(`${posY}${posX}`)
        }else if(!(document.getElementById(`${posY}${posX}`).hasChildNodes())){
          legal.push(`${posY}${posX}`)
        }
      }
      //check up laft
      posX = x - 1
      if(document.getElementById(`${posY}${posX}`)){
        if(
          (document.getElementById(`${posY}${posX}`).classList.contains("black") && this.key == "white") || 
          (document.getElementById(`${posY}${posX}`).classList.contains("white") && this.key == "black")
          ){
          legal.push(`${posY}${posX}`)
        }else if(!(document.getElementById(`${posY}${posX}`).hasChildNodes())){
          legal.push(`${posY}${posX}`)
        }
      }
    }
    
    //check down legal moves
    posY = y - 2
    if(document.getElementById(`${posY}${x}`)){
      //check right 
      posX = x + 1
      if(document.getElementById(`${posY}${posX}`)){
        if(
          (document.getElementById(`${posY}${posX}`).classList.contains("black") && this.key == "white") || 
          (document.getElementById(`${posY}${posX}`).classList.contains("white") && this.key == "black")
          ){
          legal.push(`${posY}${posX}`)
        }else if(!(document.getElementById(`${posY}${posX}`).hasChildNodes())){
          legal.push(`${posY}${posX}`)
        }
      }
      //check  laft
      posX = x - 1
      if(document.getElementById(`${posY}${posX}`)){
        if(
          (document.getElementById(`${posY}${posX}`).classList.contains("black") && this.key == "white") || 
          (document.getElementById(`${posY}${posX}`).classList.contains("white") && this.key == "black")
          ){
          legal.push(`${posY}${posX}`)
        }else if(!(document.getElementById(`${posY}${posX}`).hasChildNodes())){
          legal.push(`${posY}${posX}`)
        }
      }
    }
    
    //check left legalMoves
    posX = x - 2
    posY = y
    if(document.getElementById(`${posY}${posX}`)){
      //check up 
      posY = y + 1
      if(document.getElementById(`${posY}${posX}`)){
        if(
          (document.getElementById(`${posY}${posX}`).classList.contains("black") && this.key == "white") || 
          (document.getElementById(`${posY}${posX}`).classList.contains("white") && this.key == "black")
          ){
          legal.push(`${posY}${posX}`)
        }else if(!(document.getElementById(`${posY}${posX}`).hasChildNodes())){
          legal.push(`${posY}${posX}`)
        }
      }
      //check down
      posY = y - 1
      if(document.getElementById(`${posY}${posX}`)){
        if(
          (document.getElementById(`${posY}${posX}`).classList.contains("black") && this.key == "white") || 
          (document.getElementById(`${posY}${posX}`).classList.contains("white") && this.key == "black")
          ){
          legal.push(`${posY}${posX}`)
        }else if(!(document.getElementById(`${posY}${posX}`).hasChildNodes())){
          legal.push(`${posY}${posX}`)
        }
      }
    }
    
    //check right legalMoves
    posX = x + 2
    posY = y
    if(document.getElementById(`${posY}${posX}`)){
      //check up 
      posY = y + 1
      if(document.getElementById(`${posY}${posX}`)){
        if(
          (document.getElementById(`${posY}${posX}`).classList.contains("black") && this.key == "white") || 
          (document.getElementById(`${posY}${posX}`).classList.contains("white") && this.key == "black")
          ){
          legal.push(`${posY}${posX}`)
        }else if(!(document.getElementById(`${posY}${posX}`).hasChildNodes())){
          legal.push(`${posY}${posX}`)
        }
      }
      //check down
      posY = y - 1
      if(document.getElementById(`${posY}${posX}`)){
        if(
          (document.getElementById(`${posY}${posX}`).classList.contains("black") && this.key == "white") || 
          (document.getElementById(`${posY}${posX}`).classList.contains("white") && this.key == "black")
          ){
          legal.push(`${posY}${posX}`)
        }else if(!(document.getElementById(`${posY}${posX}`).hasChildNodes())){
          legal.push(`${posY}${posX}`)
        }
      }
    }
  
    this.setLegal(legal)
  }
}

class Bishop extends Piece{
  events(){
    this.div.addEventListener("click",()=>{
      if(this.key==colorPlay)this.legalMovesBishop()
    })
  }
  
  legalMovesBishop(){
    let legal = []
    let y = Number(this.pos[0])
    let x = Number(this.pos[1])
    let c = y
    let c2 = x
    
    //diagonal up right
    while(c<8 && c2<8){
      c++
      c2++
      if(document.getElementById(`${c}${c2}`).children.length == 0){
        legal.push(`${c}${c2}`)
      }
      else if(document.getElementById(`${c}${c2}`).classList.contains("black")){
        if(this.key == "white"){
          legal.push(`${c}${c2}`)
          break
        }else{
          break
        }
      }
      else if(document.getElementById(`${c}${c2}`).classList.contains("white")){
        if(this.key == "black"){
          legal.push(`${c}${c2}`)
          break
        }else{
          break
        }
      }
    }
    
    //diagonal up left
    c = y
    c2 = x
    while(c<8 && c2>1){
      c++
      c2--
      if(document.getElementById(`${c}${c2}`).children.length == 0){
        legal.push(`${c}${c2}`)
      }
      else if(document.getElementById(`${c}${c2}`).classList.contains("black")){
        if(this.key == "white"){
          legal.push(`${c}${c2}`)
          break
        }else{
          break
        }
      }
      else if(document.getElementById(`${c}${c2}`).classList.contains("white")){
        if(this.key == "black"){
          legal.push(`${c}${c2}`)
          break
        }else{
          break
        }
      }
    }
    
    //diagonal down left
    c = y
    c2 = x
    while(c>1 && c2>1){
      c--
      c2--
      if(document.getElementById(`${c}${c2}`).children.length == 0){
        legal.push(`${c}${c2}`)
      }
      else if(document.getElementById(`${c}${c2}`).classList.contains("black")){
        if(this.key == "white"){
          legal.push(`${c}${c2}`)
          break
        }else{
          break
        }
      }
      else if(document.getElementById(`${c}${c2}`).classList.contains("white")){
        if(this.key == "black"){
          legal.push(`${c}${c2}`)
          break
        }else{
          break
        }
      }
    }
    
    //diagonal down right
    c = y
    c2 = x
    while(c>1 && c2<8){
      c--
      c2++
      if(document.getElementById(`${c}${c2}`).children.length == 0){
        legal.push(`${c}${c2}`)
      }
      else if(document.getElementById(`${c}${c2}`).classList.contains("black")){
        if(this.key == "white"){
          legal.push(`${c}${c2}`)
          break
        }else{
          break
        }
      }
      else if(document.getElementById(`${c}${c2}`).classList.contains("white")){
        if(this.key == "black"){
          legal.push(`${c}${c2}`)
          break
        }else{
          break
        }
      }
    }
    
    if(this.id == "wq" || this.id == "bq"){
      console.log(legal, 'b')
      return legal
    }else{
      this.setLegal(legal)
    }
  }
}

class King extends Piece{
  events(){
    this.div.addEventListener("click",()=>{
      if(this.key==colorPlay)this.legalMoves()
    })
  }
  
  legalMoves(){
    let legal = []
    let x = this.pos[1]
    let y = this.pos[0]
    for(i = -1; i < 2; i++){
      for(j = -1; j < 2; j++){
        if(document.getElementById(`${y+i}${x+i}`)){
          
        }
      }
    }
  }
}

class Queen extends Piece{
  constructor({key, pos, id, svg}){
    super({key, pos, id, svg})
  }
  
  events(){
    this.div.addEventListener("click",()=>{
      if(this.key==colorPlay)this.queenLegalMoves()
    })
  }
  
  queenLegalMoves(){
    const rookMoves = new Rook({key: this.key, id: this.id, pos: this.pos, svg: ""})
    const bishopMoves = new Bishop({key: this.key, id: this.id, pos: this.pos, svg: ""})
    let legal = []
    legal = bishopMoves.legalMovesBishop()
    rookMoves.legalMovesRook().forEach(l=>legal.push(l))
    
    this.setLegal(legal)
  }
}



function setUpPieces(){
  colorPlay = "white"
  
  for(let i = 1; i < 9; i++){
    whtPawn[i-1] = new Pawn({key: "white", pos: `2${i}`, id: `wp${i}`, svg: white[5].value})
    whtPawn[i-1].addToBoard()
  }
  
  for(let i = 1; i < 3; i++){
    whtRok[i-1] = new Rook({key: "white", pos: `1${i==1?i:8}`, id: `wr${i}`, svg: white[0].value})
    whtRok[i-1].addToBoard()
  }
  
  for(let i = 1; i < 3; i++){
    whtKngt[i-1] = new Knight({key: "white", pos: `1${i==1?2:7}`, id: `wkt${i}`, svg: white[1].value})
    whtKngt[i-1].addToBoard()
  }
  
  for(let i = 1; i < 3; i++){
    whtBish[i-1] = new Bishop({key: "white", pos: `1${i==1?3:6}`, id: `wb${i}`, svg: white[2].value})
    whtBish[i-1].addToBoard()
  }
  
  whtKing = new King({key: "white", pos: "15", id: "wk", svg: white[4].value})
  whtKing.addToBoard()
  whtQuen[0] = new Queen({key: "white", pos: "14", id: "wq", svg: white[3].value})
  whtQuen[0].addToBoard()
  
  
  for(let i = 1; i < 3; i++){
    blkRok[i-1] = new Rook({key: "black", pos: `8${i==1?i:8}`, id: `br${i}`, svg: black[0].value})
    blkRok[i-1].addToBoard()
  }
  
  for(let i = 1; i < 9; i++){
    blkPawn[i-1] = new Pawn({key: "black", pos: `7${i}`, id: `bp${i}`, svg: black[5].value})
    blkPawn[i-1].addToBoard()
  }
  
  for(let i = 1; i < 3; i++){
    blkKngt[i-1] = new Knight({key: "black", pos: `8${i==1?2:7}`, id: `bkt${i}`, svg: black[1].value})
    blkKngt[i-1].addToBoard()
  }
  
  for(let i = 1; i < 3; i++){
    blkBish[i-1] = new Bishop({key: "black", pos: `8${i==1?3:6}`, id: `bb${i}`, svg: black[2].value})
    blkBish[i-1].addToBoard()
  }
  
  blkKing = new King({key: "black", pos: "85", id: "bkg", svg: black[4].value})
  blkKing.addToBoard()
  
  blkQuen[0] = new Queen({key: "black", pos: "84", id: "bq", svg: black[3].value})
  blkQuen[0].addToBoard()
  
}

setUpPieces()