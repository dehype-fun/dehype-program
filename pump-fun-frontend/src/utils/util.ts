import axios, { AxiosRequestConfig } from 'axios'
import { ChartTable, coinInfo, msgInfo, replyInfo, userInfo } from './types';

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const headers: Record<string, string> = {
    "ngrok-skip-browser-warning": "true",
};

const config: AxiosRequestConfig = {
    headers,
};

export const test = async () => {
    const res = await fetch(`${BACKEND_URL}`);
    const data = await res.json();
    console.log(data)
}
export const getUser = async ({ id }: { id: string }): Promise<any> => {
    try {
        const response = await axios.get(`${BACKEND_URL}/user/${id}`, config)
        console.log("response:", response.data)
        return response.data
    } catch (err) {
        return { error: "error setting up the request" }
    }
}

export const walletConnect = async ({ data }: { data: userInfo }): Promise<any> => {
    try {
        console.log("============walletConnect=========")
        const response = await axios.post(`${BACKEND_URL}/user/`, data)
        console.log("==============response=====================", response.data, config)
        return response.data
    } catch (err) {
        return { error: "error setting up the request" }
    }
}


export const confirmWallet = async ({ data }: { data: userInfo }): Promise<any> => {
    try {
        const response = await axios.post(`${BACKEND_URL}/user/confirm`, data, config)
        return response.data
    } catch (err) {
        return { error: "error setting up the request" }
    }
}

export const createNewCoin = async (data: coinInfo) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/coin/`, data, config)
        return response.data
    } catch (err) {
        return { error: "error setting up the request" }
    }
}

export const getCoinsInfo = async (): Promise<coinInfo[]> => {
    const res = await axios.get(`${BACKEND_URL}/coin`, config);
    console.log("coin", `${BACKEND_URL}/coin`)
    return res.data
}
export const getCoinsInfoBy = async (id: string): Promise<coinInfo[]> => {

    const res = await axios.get<coinInfo[]>(`${BACKEND_URL}/coin/user/${id}`, config);
    return res.data
}
export const getCoinInfo = async (data: string): Promise<any> => {
    try {
        console.log("coinINfo", data)
        const response = await axios.get(`${BACKEND_URL}/coin/${data}`, config)
        return response.data
    } catch (err) {
        return { error: "error setting up the request" }
    }
}

export const getUserInfo = async (data: string): Promise<any> => {
    try {
        const response = await axios.get(`${BACKEND_URL}/user/${data}`, config)
        return response.data
    } catch (err) {
        return { error: "error setting up the request" }
    }
}

export const getMessageByCoin = async (data: string): Promise<msgInfo[]> => {
    try {
        const response = await axios.get(`${BACKEND_URL}/feedback/coin/${data}`, config)
        console.log("messages:", response.data)
        return response.data
    } catch (err) {
        return [];
    }
}


export const getCoinTrade = async (data: string): Promise<any> => {
    try {
        const response = await axios.get(`${BACKEND_URL}/cointrade/${data}`, config)
        console.log("trade response::", response)
        return response.data
    } catch (err) {
        return { error: "error setting up the request" }
    }
}

export const postReply = async (data: replyInfo) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/feedback/`, data, config)
        return response.data
    } catch (err) {
        return { error: "error setting up the request" }
    }
}

// ===========================Functions=====================================
const JWT = process.env.NEXT_PUBLIC_PINATA_PRIVATE_KEY;

export const pinFileToIPFS = async (blob: File) => {
    try {
        const data = new FormData();
        data.append("file", blob);
        data.append("upload_preset", "my-preset");

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/my-cloud/image/upload`,
            {
                method: "POST",
                body: data,
            }
        );

        const resData = await res.json();
        return resData;
    } catch (error) {
        console.log("Error uploading file to Cloudinary:", error);
    }
};

export const uploadImage = async (url: string): Promise<string | false> => {
    try {
        // Fetch the image from the provided URL
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        // Convert the response to a Blob and then to a File
        const blob = await response.blob();
        const imageFile = new File([blob], 'image.png', { type: 'image/png' });

        // Create a FormData instance and append the image file
        const formData = new FormData();
        formData.append('file', imageFile);

        // Upload the image to your backend API
        const uploadResponse = await axios.post(`${BACKEND_URL}/upload`, formData, {
            ...config,
            headers: {
                ...config.headers,
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log("uploadResponse:", uploadResponse)
        // Assuming your backend returns a URL or identifier for the uploaded image
        const imageUrl = uploadResponse.data?.url || '';
        console.log("imageUrl:", imageUrl)
        return imageUrl || false;
    } catch (error) {
        console.error('Error uploading image:', error);
        return false;
    }
};