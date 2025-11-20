interface ErrorProp {
  error: unknown;
}

function ErrorPage({error}: ErrorProp) {
  return <div><h1>ErrorPage</h1><h3>{String(error)}</h3></div>;
}

export default ErrorPage;
