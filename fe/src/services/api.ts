import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import type { Token } from "../types/auth";
import { use } from "react";
import { useNotificationStore } from "../stores/useNotificationStore";

export abstract class ApiClient {
  protected readonly client: AxiosInstance;
  protected token: Token;

  constructor(
    baseURL: string,
    token: Token
  ) {
    this.client = axios.create({
      baseURL,
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
      },
    });
    this.token = token;
    this.setupInterceptors();
  }


  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const normalized = new Error(
          error.response?.data?.message || error.message || "Request failed"
        );
        return Promise.reject(normalized);
      }
    );
  }

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return (await this.client.get<T>(url, config)).data;
  }

  protected async post<T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return (await this.client.post<T>(url, body, config)).data;
  }

  protected async put<T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return (await this.client.put<T>(url, body, config)).data;
  }

  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return (await this.client.delete<T>(url, config)).data;
  }
}


