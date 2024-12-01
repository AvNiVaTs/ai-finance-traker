import fetch from 'node-fetch'; // Using import instead of require
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';  // Import fs module to read files

// Initialize Express app
const app = express();

// Use body-parser middleware to parse JSON requests
app.use(bodyParser.json());

// Serve static files from 'public' directory
app.use(express.static('../public'));  // Updated to reference the correct directory

// API Key for Alpha Vantage
const API_KEY = 'E5TYKQQ5UTE8LNY4'; // Replace with your actual API key

// Endpoint to handle financial advice requests
app.post('/advice', async (req, res) => {
  const { savings, expenses, stockSymbol } = req.body;
  console.log(`Received savings: ${savings}, expenses: ${expenses}, stockSymbol: ${stockSymbol}`);

  // Validate input
  if (isNaN(savings) || isNaN(expenses)) {
    return res.status(400).json({ advice: 'Invalid input. Please provide valid savings and expenses.' });
  }

  // Generate advice based on savings and expenses
  let advice = generateFinancialAdvice(savings, expenses);

  // Ensure the stockSymbol is provided, otherwise, default to 'AAPL'
  const symbol = stockSymbol || 'AAPL'; // If stockSymbol is undefined, default to 'AAPL'

  // Get stock data and generate advice based on market trends (use Alpha Vantage API)
  const marketAdvice = await getStockAdvice(symbol);  // Use the correct stock symbol from the request

  // Combine generated advice with market advice
  advice = `${advice} Also, here's some market advice for ${symbol}: ${marketAdvice}`;

  // Send the advice back to the client
  res.json({ advice });
});


// Generate basic financial advice based on savings and expenses
function generateFinancialAdvice(savings, expenses) {
  if (savings < expenses) {
    return "Your expenses exceed your savings! Consider cutting down on non-essential expenses.";
  } else if (savings < 3000) {
    return "Your savings are quite low. It's important to prioritize building an emergency fund.";
  } else if (savings >= 3000 && savings < 5000) {
    return "You're starting to save, but try to save more for emergencies. Aim for at least 3-6 months of living expenses.";
  } else if (savings >= 5000 && savings < 10000) {
    return "You're doing well with your savings! Try to continue building an emergency fund while exploring low-risk investments.";
  } else if (savings >= 10000 && savings < 20000) {
    return "Great job! You're on track with your savings. Consider investing a portion in diversified stocks or retirement accounts.";
  } else if (savings >= 20000 && savings < 50000) {
    return "You're in an excellent position with your savings! Look into long-term investment options, such as index funds or real estate.";
  } else {
    return "Outstanding savings! You may want to consider more advanced investment strategies or focus on retirement planning.";
  }
}

// Get stock data from Alpha Vantage API and generate stock advice
async function getStockAdvice(symbol) {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data["Error Message"]) {
      throw new Error("Invalid API request or symbol");
    }

    const timeSeries = data["Time Series (Daily)"];
    const dates = Object.keys(timeSeries);
    const latestDate = dates[0];
    const latestClose = timeSeries[latestDate]["4. close"];

    // Example: Provide advice based on the closing price
    if (latestClose > 1500) {
      return `The stock price of ${symbol} is quite high right now. Consider waiting for a dip.`;
    } else {
      return `The stock price of ${symbol} is lower. It might be a good buying opportunity.`;
    }
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return "Could not retrieve stock data for ${symbol}. Please try again later.";
  }
}

app.get('/test-advices', async (req, res) => {
  // Load the data from the JSON file
  fs.readFile('./data.json', 'utf8', async (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read data file.' });
    }

    const requestsData = JSON.parse(data);  // Parse the JSON data

    const responses = [];
    for (const entry of requestsData) {
      // Send a request to the /advice endpoint for each data entry
      const adviceResponse = await fetch('http://localhost:3000/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });

      const result = await adviceResponse.json();
      responses.push({ data: entry, advice: result.advice });
    }

    // Send back all the advice as a response
    res.json(responses);
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
