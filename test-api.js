async function testAPI() {
  try {
    console.log("Testing pricing plans API...");

    const response = await fetch("http://localhost:3000/api/pricing-plans");
    if (response.ok) {
      const plans = await response.json();
      console.log("Pricing plans:", plans.length);
      console.log("First plan:", plans[0]);
    } else {
      console.error("Failed to fetch pricing plans:", response.status);
    }

    console.log("Testing clinics API...");
    const clinicsResponse = await fetch("http://localhost:3000/api/clinics");
    if (clinicsResponse.ok) {
      const clinics = await clinicsResponse.json();
      console.log("Clinics:", clinics.length);
      console.log("First clinic:", clinics[0]);
    } else {
      console.error("Failed to fetch clinics:", clinicsResponse.status);
    }
  } catch (error) {
    console.error("API test failed:", error);
  }
}

testAPI();
