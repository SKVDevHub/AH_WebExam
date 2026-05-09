/healthfinder-quote-calculator

&nbsp; ├── index.html

&nbsp; ├── styles.css

&nbsp; ├── script.js





**1. HTML (index.html)**

<!DOCTYPE html>

<html lang="en">

<head>

&nbsp;   <meta charset="UTF-8">

&nbsp;   <meta name="viewport" content="width=device-width, initial-scale=1.0">

&nbsp;   <title>HealthFinder Quote Calculator</title>

&nbsp;   <link rel="stylesheet" href="styles.css">

</head>

<body>

&nbsp;   <header>

&nbsp;       <h1>Affinity Health - Quote Calculator</h1>

&nbsp;   </header>



&nbsp;   <main>

&nbsp;       <form id="quoteForm">

&nbsp;           <label for="plan">Select Plan:</label>

&nbsp;           <select id="plan">

&nbsp;               <option value="basic">Basic</option>

&nbsp;               <option value="comprehensive">Comprehensive</option>

&nbsp;           </select>



&nbsp;           <label for="age">Enter Your Age:</label>

&nbsp;           <input type="number" id="age" min="18" required>



&nbsp;           <label for="dependents">Number of Dependents:</label>

&nbsp;           <input type="number" id="dependents" min="0" required>



&nbsp;           <label for="province">Select Province:</label>

&nbsp;           <select id="province">

&nbsp;               <option value="gp">Gauteng</option>

&nbsp;               <option value="wc">Western Cape</option>

&nbsp;               <option value="kzn">KwaZulu-Natal</option>

&nbsp;           </select>



&nbsp;           <button type="button" id="calculate">Get My Quote</button>

&nbsp;       </form>



&nbsp;       <div id="result"></div>

&nbsp;   </main>



&nbsp;   <script src="script.js"></script>

</body>

</html>



**2. CSS (styles.css)**



body {

&nbsp;   font-family: Arial, sans-serif;

&nbsp;   margin: 0;

&nbsp;   padding: 0;

&nbsp;   background-color: #f4f4f4;

&nbsp;   text-align: center;

}



header {

&nbsp;   background-color: #0077b6;

&nbsp;   color: white;

&nbsp;   padding: 15px;

}



main {

&nbsp;   margin: 20px auto;

&nbsp;   width: 80%;

&nbsp;   max-width: 400px;

&nbsp;   background: white;

&nbsp;   padding: 20px;

&nbsp;   border-radius: 8px;

&nbsp;   box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

}



form label, form input, form select {

&nbsp;   display: block;

&nbsp;   width: 100%;

&nbsp;   margin: 10px 0;

}



button {

&nbsp;   width: 100%;

&nbsp;   padding: 10px;

&nbsp;   background-color: #0077b6;

&nbsp;   color: white;

&nbsp;   border: none;

&nbsp;   cursor: pointer;

&nbsp;   border-radius: 5px;

}



button:hover {

&nbsp;   background-color: #005f8a;

}



\#result {

&nbsp;   margin-top: 20px;

&nbsp;   font-size: 1.2em;

&nbsp;   color: #333;

}





**3. JavaScript (script.js)**



document.getElementById("calculate").addEventListener("click", function() {

&nbsp;   const plan = document.getElementById("plan").value;

&nbsp;   const age = parseInt(document.getElementById("age").value);

&nbsp;   const dependents = parseInt(document.getElementById("dependents").value);

&nbsp;   const province = document.getElementById("province").value;



&nbsp;   if (isNaN(age) || isNaN(dependents)) {

&nbsp;       alert("Please enter valid values for age and dependents.");

&nbsp;       return;

&nbsp;   }



&nbsp;   // Basic price logic

&nbsp;   let basePrice = plan === "basic" ? 500 : 1000;

&nbsp;   let ageFactor = age \* 5;

&nbsp;   let dependentCost = dependents \* 100;



&nbsp;   let total = basePrice + ageFactor + dependentCost;



&nbsp;   document.getElementById("result").innerText = `Estimated Premium: R${total}`;

});





**Bonus Challenge (Dark Mode)**



<button id="darkModeToggle">Dark Mode</button>



**Modify CSS:**



.dark-mode {

&nbsp;   background-color: #333;

&nbsp;   color: white;

}



.dark-mode main {

&nbsp;   background-color: #444;

}



.dark-mode button {

&nbsp;   background-color: #ffaa00;

}



.dark-mode button:hover {

&nbsp;   background-color: #cc8800;

}





**Update JS:**



document.getElementById("darkModeToggle").addEventListener("click", function() {

&nbsp;   document.body.classList.toggle("dark-mode");

});



