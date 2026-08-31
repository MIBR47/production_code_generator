import LoginForm from "../LoginForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="bg-black p-8 rounded-xl shadow-md w-[400px]">

                <h1 className="text-3xl font-bold mb-6">
                    Login
                </h1>

                <LoginForm />

            </div>

        </div>
    );
}