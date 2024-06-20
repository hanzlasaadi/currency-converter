import axios from "axios";
import React from "react";

export default function App() {
  const [amount, setAmount] = React.useState(0);
  const [fromCurrency, setFromCurrency] = React.useState("USD");
  const [toCurrency, setToCurrency] = React.useState("EUR");
  const [output, setOutput] = React.useState(0);
  const [date, setDate] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (amount === 0) return;

    if (fromCurrency === toCurrency) {
      setOutput(amount);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchConversion() {
      setIsLoading(true);
      await axios
        .get(
          `https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`,
          { signal }
        )
        .then((response) => {
          setOutput(response.data.rates[toCurrency]);
          setDate(response.data.date);
          setIsLoading(false);
          console.log(response.data);
        })
        .catch((error) => {
          setIsLoading(false);
          if (error.name === "CanceledError") {
            console.log(
              "Request aborted. (Canceled to avoid running multiple requests | Avoid Race)"
            );
          } else {
            console.error(error);
            alert(`An error occurred. Please try again. ${error.message}`);
          }
        });
    }
    fetchConversion();

    return () => {
      controller.abort();
      setOutput(0);
      setDate(null);
    };
  }, [amount, fromCurrency, toCurrency]);

  return (
    <div>
      <input
        type="text"
        value={amount}
        disabled={isLoading}
        onChange={(e) => {
          const value = Number(e.target.value);
          !isNaN(value) ? setAmount(value) : setAmount(0);
        }}
      />
      <CurrencySelector
        currency={fromCurrency}
        setCurrency={setFromCurrency}
        isLoading={isLoading}
      />
      <CurrencySelector
        currency={toCurrency}
        setCurrency={setToCurrency}
        isLoading={isLoading}
      />
      <p>
        OUTPUT: {output.toFixed(2)}({toCurrency}){date ? ` as of ${date}` : ""}
      </p>
    </div>
  );
}

function CurrencySelector({ currency, setCurrency, isLoading }) {
  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      disabled={isLoading}
    >
      <option value="USD">USD</option>
      <option value="EUR">EUR</option>
      <option value="CAD">CAD</option>
      <option value="KRW">KRW</option>
    </select>
  );
}
