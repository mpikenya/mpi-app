const bcrypt = require('bcrypt');

const hashedPassword = "$2b$10$TWYdCElklgdU28A5n8n.5OnI4gkEQ/xRG96JDakG3wuGcz0kBQ2aC";
const inputPassword = "AlphonceWere@MPI"; // this is the password you used in Postman

bcrypt.compare(inputPassword, hashedPassword).then(match => {
  console.log("Password match:", match);
});