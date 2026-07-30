import { describe, expect, it } from "vitest";

import * as dominio from "../index";

describe("pacote src/dominio", () => {
  it("compila e é importável sem depender do runtime da aplicação", () => {
    expect(typeof dominio).toBe("object");
  });
});
