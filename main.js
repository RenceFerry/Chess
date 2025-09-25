import { white, black } from "./chessPieces.js"

const chessBoard = document.querySelector(".chess-board")
const positions = chessBoard.querySelectorAll(".number")
const letters = Array.from({ length: 8 }, (_, i) => String.fromCharCode(97 + i));

const piecesArr = [[[]]]

class Piece{
  constructor({key, value}){
    this.key = key
    this.value = value
    
  }
}

black.forEach((piece, i)=>{
  if (piece.key == "pawn"){
    
  }else if(i>1){
    piecesArr[0][0][i] =  new Piece({key: piece.key, value: piece.value})
    piecesArr[0][0][7-i] =  new Piece({key: piece.key, value: piece.value})
    
  }else{
    
  }
})

positions.forEach((position, i) => {
  const letterId = position.parentElement.id
  position.id = `${letterId}${getIndex(position)+1}`
  console.log(position.id)
})

const setUpPieces = () => {
  
  
}



function getIndex(el) {
  return Array.from(el.parentElement.children).indexOf(el);
}


setUpPieces()