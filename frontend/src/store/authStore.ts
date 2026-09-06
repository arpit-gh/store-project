import { create } from "zustand";
import { passwordRules } from "../features/auth/lib/passwordRules";

export type SignupStep = "details" | "password" | "otp";

type AuthStore = {
	loginEmail: string;
	loginPassword: string;
	signupStep: SignupStep;
	name: string;
	organisationName: string;
	signupEmail: string;
	signupPassword: string;
	otp: string;
	isPasswordStrong: () => boolean;
	setLoginEmail: (loginEmail: string) => void;
	setLoginPassword: (loginPassword: string) => void;
	setSignupStep: (signupStep: SignupStep) => void;
	setName: (name: string) => void;
	setOrganisationName: (organisationName: string) => void;
	setSignupEmail: (signupEmail: string) => void;
	setSignupPassword: (signupPassword: string) => void;
	setOtp: (otp: string) => void;
	goToPreviousSignupStep: () => void;
	resetAuth: () => void;
};

const initialAuthState = {
	loginEmail: "",
	loginPassword: "",
	signupStep: "details" as SignupStep,
	name: "",
	organisationName: "",
	signupEmail: "",
	signupPassword: "",
	otp: "",
};

export const useAuthStore = create<AuthStore>((set, get) => ({
	...initialAuthState,
	isPasswordStrong: () =>
		passwordRules.every(({ test }) => test(get().signupPassword)),
	setLoginEmail: (loginEmail) => set({ loginEmail }),
	setLoginPassword: (loginPassword) => set({ loginPassword }),
	setSignupStep: (signupStep) => set({ signupStep }),
	setName: (name) => set({ name }),
	setOrganisationName: (organisationName) => set({ organisationName }),
	setSignupEmail: (signupEmail) => set({ signupEmail }),
	setSignupPassword: (signupPassword) => set({ signupPassword }),
	setOtp: (otp) => set({ otp }),
	goToPreviousSignupStep: () =>
		set((state) => ({
			signupStep: state.signupStep === "otp" ? "password" : "details",
		})),
	resetAuth: () => set(initialAuthState),
}));
