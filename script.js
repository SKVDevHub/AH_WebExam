document.getElementById("calculate").addEventListener("click", function() {
    const plan = document.getElementById("plan").value;
    const age = parseInt(document.getElementById("age").value);
    const dependents = parseInt(document.getElementById("dependents").value);
    const province = document.getElementById("province").value;

    if (isNaN(age) || isNaN(dependents)) {
        alert("Please enter valid values for age and dependents.");
        return;
    }

    // Basic price logic
    let basePrice = plan === "basic" ? 500 : 1000;
    let ageFactor = age * 5;
    let dependentCost = dependents * 100;

    let total = basePrice + ageFactor + dependentCost;

    document.getElementById("result").innerText = `Estimated Premium: R${total}`;
});

// Dark Mode Toggle
document.getElementById("darkModeToggle").addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");
});