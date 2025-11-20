import { isRouteErrorResponse } from "react-router";

interface ErrorProp {
  error: unknown;
}

function ErrorPage({ error }: ErrorProp) {
  if (!isRouteErrorResponse(error)) {
    return;
  }
  return (
    <div>
      <h3>{error.status}</h3>
      <h3>{error.statusText}</h3>
      <h3>{error.data}</h3>
    </div>
  );
}

export default ErrorPage;
