const Order = require("./Order");

const OrderState = Object.freeze({
  WELCOMING: Symbol("welcoming"),
  SUBWAY: Symbol("Subway"),
  SIZE: Symbol("size"),
  TOPPINGS: Symbol("toppings"),
  DRINKS: Symbol("drinks"),
  SIZE2: Symbol("size2"),
  TOPPINGS2: Symbol("toppings2"),
  SOFTY: Symbol("softy"),
  PAYMENT: Symbol("payment")
});

const subwayPrice = 10;
const hamburgerPrice = 6;
const drinkPrice = 3;
const softyPrice = 5;
const taxPer = 13;

module.exports = class ShwarmaOrder extends Order {
  constructor(sNumber, sUrl) {
    super(sNumber, sUrl);
    this.stateCur = OrderState.WELCOMING;
    this.sSubway = "";
    this.sSize = "";
    this.sToppings = "";
    this.sDrinks = "";
    this.sItem = "";
    this.sSize2 = "";
    this.sToppings2 = "";
    this.sSofty = "";
    this.sItem2 = "";

    this.nOrder = 0;

  }
  handleInput(sInput) {
    let aReturn = [];
    switch (this.stateCur) {
      case OrderState.WELCOMING:
        this.stateCur = OrderState.SUBWAY;
        aReturn.push("Welcome to Akshay Subway Center.");
        aReturn.push("Would you like subway? Please enter yes or no?");
        break;
      case OrderState.SUBWAY:
        if (sInput == "yes") {
          this.stateCur = OrderState.SIZE;
          this.sItem = "subway";
          aReturn.push("What size of subway would you like?");
          break;
        }
        this.stateCur = OrderState.ORDER2;
        aReturn.push("Would you like hamburger as well? Please enter yes or no?");
        break;
      case OrderState.SIZE:
        this.stateCur = OrderState.TOPPINGS
        this.sSize = sInput;
        aReturn.push("What toppings would you like?");
        break;
      case OrderState.TOPPINGS:
        this.stateCur = OrderState.ORDER2
        this.sToppings = sInput;
        this.nOrder += subwayPrice;
        aReturn.push("Would you like hamburger as well? Please enter yes or no?");
        break;
      case OrderState.ORDER2:
        if (sInput.toLowerCase() == "yes") {
          this.stateCur = OrderState.SIZE2;
          this.sItem2 = "hamburger";
          aReturn.push("What size of hamburger would you like?");
          this.nOrder += hamburgerPrice;
          break;
        }
        this.stateCur = OrderState.SOFTY;
        aReturn.push("Would you like a softy with that? Please enter Vanilla,chocolate or no?");
        break;
      case OrderState.SIZE2:
        this.stateCur = OrderState.TOPPINGS2
        this.sSize2 = sInput;
        aReturn.push("What toppings would you like on your hamburger?");
        break;
      case OrderState.TOPPINGS2:
        this.stateCur = OrderState.SOFTY
        this.sToppings2 = sInput;
        aReturn.push("Would you like a softy with that? Please enter vanilla,chocolate or no?");
        break;
      case OrderState.SOFTY:
        this.stateCur = OrderState.DRINKS
        this.sSofty = sInput;
        if (sInput.toLowerCase() != "no") {
          this.nOrder += softyPrice;
        }
        aReturn.push("Would you like a drink with that?");
        break;
      case OrderState.DRINKS:
        this.stateCur = OrderState.PAYMENT;
        console.log(this.nOrder)
        //this.nOrder = 15;

        if (sInput.toLowerCase() != "no") {
          this.sDrinks = sInput;
        }

        aReturn.push("Thank-you for your order of");
        if (this.sItem) {
          aReturn.push(`${this.sSize} ${this.sItem} with ${this.sToppings}`);
        }


        if (this.sItem2) {
          aReturn.push(`${this.sSize2} ${this.sItem2} with ${this.sToppings2}`);
        }

        if (this.sSofty.toLowerCase() != "no") {
          aReturn.push(`Softy: ${this.sSofty}`)
        }

        if (this.sDrinks) {
          aReturn.push(`Drinks: ${this.sDrinks}`);
          this.nOrder += drinkPrice;

        }
        let totalTax = this.nOrder * taxPer / 100
        this.nOrder += totalTax;
        aReturn.push(`Your Order Bill: $${this.nOrder}`)
        aReturn.push(`Please pay for your order here`);
        aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
        break;
      case OrderState.PAYMENT:
        console.log(sInput);
        console.log("=======================================================");
        console.log(sInput.purchase_units[0]);
        this.isDone(true);
        let d = new Date();
        d.setMinutes(d.getMinutes() + 20);
        aReturn.push(`Your order will be delivered at ${d.toTimeString()}`);
        aReturn.push(`Your payment Successfully Completed!`);
        aReturn.push(`Shpping Delivery Customer Name: ${sInput.purchase_units[0].shipping.name.full_name}`)
        aReturn.push(`Delivery Address: ${sInput.purchase_units[0].shipping.address.address_line_1}, 
        ${sInput.purchase_units[0].shipping.address.address_line_2 ? sInput.purchase_units[0].shipping.address.address_line_2 : ''}
        ${sInput.purchase_units[0].shipping.address.postal_code}, ${sInput.purchase_units[0].shipping.address.country_code}`);
        
        break;
    }
    return aReturn;
  }
  renderForm(sTitle = "-1", sAmount = "-1") {
    // your client id should be kept private
    if (sTitle != "-1") {
      this.sItem = sTitle;
    }
    if (sAmount != "-1") {
      this.nOrder = sAmount;
    }
    const sClientID = process.env.SB_CLIENT_ID || 'AaNT2O_FCLdHkgW6_M4nNZYKCdHSCTO-zySJot8Fub5FZlIRR3d1ZNVtXlfjTbuRYSpKcIlAf68_OC8r'
    // put your client id here for testing ... Make sure that you delete it before committing
    return (`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your ${this.sItem} order of $${this.nOrder}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nOrder}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);

  }
}