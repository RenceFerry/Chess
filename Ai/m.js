const board = document.getElementById("chessboard");
const promotionModal = document.getElementById("promotionModal");

let initialBoard = [
  ["♜","♞","♝","♛","♚","♝","♞","♜"],
  ["♟","♟","♟","♟","♟","♟","♟","♟"],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["♙","♙","♙","♙","♙","♙","♙","♙"],
  ["♖","♘","♗","♕","♔","♗","♘","♖"]
];

let turn = "white";
let selected = null;
let enPassant = null;
let castlingRights = {white: {K:true,Q:true}, black:{K:true,Q:true}};
let moveHistory = [];

function createBoard() {
  board.innerHTML = "";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      square.classList.add("square", (row+col)%2===0 ? "light" : "dark");
      square.dataset.row = row;
      square.dataset.col = col;
      square.textContent = initialBoard[row][col];
      square.addEventListener("click", handleClick);
      board.appendChild(square);
    }
  }
}

function handleClick(e) {
  const square = e.currentTarget;
  const row = parseInt(square.dataset.row);
  const col = parseInt(square.dataset.col);
  const piece = initialBoard[row][col];

  if (selected) {
    const [sRow, sCol] = selected;
    if (isLegalMove(initialBoard[sRow][sCol], sRow, sCol, row, col)) {
      movePiece(sRow, sCol, row, col);
      turn = (turn === "white") ? "black" : "white";
    }
    selected = null;
    createBoard();
  } else {
    if ((turn === "white" && "♙♖♘♗♕♔".includes(piece)) ||
        (turn === "black" && "♟♜♞♝♛♚".includes(piece))) {
      selected = [row, col];
      square.classList.add("highlight");
    }
  }
}

function movePiece(sRow, sCol, row, col) {
  let piece = initialBoard[sRow][sCol];
  let target = initialBoard[row][col];

  // Save move history
  moveHistory.push(JSON.parse(JSON.stringify(initialBoard)));

  // Handle en passant capture
  if ((piece==="♙"||piece==="♟") && enPassant && row===enPassant.row && col===enPassant.col) {
    if (piece==="♙") initialBoard[row+1][col] = "";
    if (piece==="♟") initialBoard[row-1][col] = "";
  }

  initialBoard[row][col] = piece;
  initialBoard[sRow][sCol] = "";

  // Handle castling
  if (piece==="♔" && sRow===7 && sCol===4) {
    if (col===6) { initialBoard[7][5]="♖"; initialBoard[7][7]=""; }
    if (col===2) { initialBoard[7][3]="♖"; initialBoard[7][0]=""; }
    castlingRights.white={K:false,Q:false};
  }
  if (piece==="♚" && sRow===0 && sCol===4) {
    if (col===6) { initialBoard[0][5]="♜"; initialBoard[0][7]=""; }
    if (col===2) { initialBoard[0][3]="♜"; initialBoard[0][0]=""; }
    castlingRights.black={K:false,Q:false};
  }

  // Track en passant availability
  if (piece==="♙" && sRow===6 && row===4) enPassant={row:5,col};
  else if (piece==="♟" && sRow===1 && row===3) enPassant={row:2,col};
  else enPassant=null;

  // Handle pawn promotion
  if (piece==="♙" && row===0) {
    showPromotionModal("white", row, col);
  }
  if (piece==="♟" && row===7) {
    showPromotionModal("black", row, col);
  }
}

function showPromotionModal(color,row,col) {
  promotionModal.style.display="block";
  promotionModal.querySelectorAll("button").forEach(btn=>{
    btn.onclick=()=>{
      let promoted=btn.dataset.piece;
      if (color==="black") {
        promoted={"♕":"♛","♖":"♜","♗":"♝","♘":"♞"}[promoted];
      }
      initialBoard[row][col]=promoted;
      promotionModal.style.display="none";
      createBoard();
    }
  });
}

function isLegalMove(piece,sRow,sCol,row,col) {
  const dr=row-sRow, dc=col-sCol;
  const target=initialBoard[row][col];

  if ((turn==="white" && "♙♖♘♗♕♔".includes(target)) ||
      (turn==="black" && "♟♜♞♝♛♚".includes(target))) return false;

  let legal = false;
  switch(piece) {
    case "♙": // white pawn
      if (dr===-1 && dc===0 && target==="") legal = true;
      if (sRow===6 && dr===-2 && dc===0 && target==="" && initialBoard[5][col]==="") legal = true;
      if (dr===-1 && Math.abs(dc)===1 && (target!=="" || (enPassant&&row===enPassant.row&&col===enPassant.col))) legal = true;
      break;
    case "♟": // black pawn
      if (dr===1 && dc===0 && target==="") legal = true;
      if (sRow===1 && dr===2 && dc===0 && target==="" && initialBoard[2][col]==="") legal = true;
      if (dr===1 && Math.abs(dc)===1 && (target!=="" || (enPassant&&row===enPassant.row&&col===enPassant.col))) legal = true;
      break;
    case "♖": case "♜":
      if (dr===0 || dc===0) legal = pathClear(sRow,sCol,row,col);
      break;
    case "♗": case "♝":
      if (Math.abs(dr)===Math.abs(dc)) legal = pathClear(sRow,sCol,row,col);
      break;
    case "♕": case "♛":
      if (dr===0||dc===0||Math.abs(dr)===Math.abs(dc)) legal = pathClear(sRow,sCol,row,col);
      break;
    case "♔":
      if (Math.abs(dr)<=1 && Math.abs(dc)<=1) legal = true;
      if (sRow===7 && sCol===4 && dr===0 && dc===2 && castlingRights.white.K &&
          initialBoard[7][5]==="" && initialBoard[7][6]==="") legal = true;
      if (sRow===7 && sCol===4 && dr===0 && dc===-2 && castlingRights.white.Q &&
          initialBoard[7][3]==="" && initialBoard[7][2]==="" && initialBoard[7][1]==="") legal = true;
      break;
    case "♚":
      if (Math.abs(dr)<=1 && Math.abs(dc)<=1) legal = true;
      if (sRow===0 && sCol===4 && dr===0 && dc===2 && castlingRights.black.K &&
          initialBoard[0][5]==="" && initialBoard[0][6]==="") legal = true;
      if (sRow===0 && sCol===4 && dr===0 && dc===-2 && castlingRights.black.Q &&
          initialBoard[0][3]==="" && initialBoard[0][2]==="" && initialBoard[0][1]==="") legal = true;
      break;
    case "♘": case "♞":
      if ((Math.abs(dr)===2 && Math.abs(dc)===1)||(Math.abs(dr)===1 && Math.abs(dc)===2)) legal = true;
      break;
  }

  // Prevent moves leaving own king in check
  if (legal) {
    let backup = JSON.parse(JSON.stringify(initialBoard));
    let tmpPiece = initialBoard[row][col];
    initialBoard[row][col] = piece;
    initialBoard[sRow][sCol] = "";
    let inCheck = isKingInCheck(turn);
    initialBoard = backup;
    return !inCheck;
  }
  return false;
}

function pathClear(sRow,sCol,row,col) {
  let dr=Math.sign(row-sRow), dc=Math.sign(col-sCol);
  let r=sRow+dr,c=sCol+dc;
  while(r!==row||c!==col) {
    if(initialBoard[r][c]!=="") return false;
    r+=dr; c+=dc;
  }
  return true;
}

function isKingInCheck(color) {
  let kingPiece = (color==="white")?"♔":"♚";
  let kingPos=null;
  for (let r=0;r<8;r++){
    for (let c=0;c<8;c++){
      if(initialBoard[r][c]===kingPiece) kingPos=[r,c];
    }
  }
  for (let r=0;r<8;r++){
    for (let c=0;c<8;c++){
      let p=initialBoard[r][c];
      if(p!=="" && ((color==="white" && "♟♜♞♝♛♚".includes(p)) ||
                    (color==="black" && "♙♖♘♗♕♔".includes(p)))){
        if(isLegalMove(p,r,c,kingPos[0],kingPos[1])) return true;
      }
    }
  }
  return false;
}

createBoard();
