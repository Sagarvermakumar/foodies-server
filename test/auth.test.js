

describe("Auth APIs", () => {
  test("POST /api/v1/auth/register -> 201", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ name: "Sam", email: "sam@test.com", password: "secret123" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("sam@test.com");
  });

  test("POST /api/v1/auth/login -> 200", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({ name: "Sam", email: "sam@test.com", password: "secret123" });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "sam@test.com", password: "secret123" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});
