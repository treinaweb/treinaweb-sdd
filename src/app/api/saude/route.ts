export async function GET() {
  return Response.json({
    status: "ok",
    agora: new Date().toISOString(),
  });
}
