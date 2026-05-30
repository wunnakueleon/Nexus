import api from "../../../api";
import type { AuthResponse, SignInPayload, SignUpPayload } from "../types/auth.types";

export const signUp = async (payload: SignUpPayload): Promise<AuthResponse> => {
	const { data } = await api.post<AuthResponse>("/auth/signup", payload);
	return data;
};

export const signIn = async (payload: SignInPayload): Promise<AuthResponse> => {
	const { data } = await api.post<AuthResponse>("/auth/signin", payload);
	return data;
};
