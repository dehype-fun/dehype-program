import axios from 'axios';
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


interface MarketCreationData {
  creator: string;
  title: string;
  description: string;
  endDate: Date;
  outcomes: string[];
}

interface MarketCreationResponse {
  _id: string;
  creator: string;
  title: string;
  description: string;
  endDate: string;
  outcomes: string[];
  outcomeMints: string[];
  settled: boolean;
}

const config = {
  headers: {
    'Content-Type': 'application/json',
    // Add any other headers you need, such as authentication tokens
  }
};
export const createNewMarket = async (data: MarketCreationData): Promise<MarketCreationResponse | { error: string }> => {
  try {
    const response = await axios.post<MarketCreationResponse>(`${BACKEND_URL}/markets`, data, config);
    return response.data;
  } catch (err) {
    console.error('Error creating market:', err);
    return { error: "Error creating the market" };
  }
};
