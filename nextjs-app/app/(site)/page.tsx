import AuthForm from "./components/AuthForm";

const Auth = () => {
  return (
    <div
      className="
        flex
        flex-none
        min-h-full
        flex-col
        justify-center
      bg-zinc-800	
      "
    >
      <AuthForm />
    </div>
  );
};

export default Auth;
