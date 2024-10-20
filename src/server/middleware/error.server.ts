export const routeError = (message: string, status: number) => {
  return new Response(
    JSON.stringify({
      error: message,
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};
