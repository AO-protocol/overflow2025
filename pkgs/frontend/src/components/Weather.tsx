"use client";

import { getWeatherInfo } from "@/lib/actions";
import { useState } from "react";

// Define the type for weather data
interface WeatherData {
  text: string;
}

export function Weather() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(event.currentTarget);
      const city = formData.get("city") as string;
      const result = await getWeatherInfo(city);
      setWeatherData(result);
      console.log(result);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">x402 Walrus Agent</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            name="city"
            placeholder="Enter city name"
            className="px-3 py-2 border rounded flex-1"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={loading}
          >
            {loading ? "Loading..." : "Let's go!"}
          </button>
        </div>
      </form>

      {weatherData && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <p className="whitespace-pre-wrap text-gray-900">
            {weatherData.text}
          </p>
        </div>
      )}
    </div>
  );
}
