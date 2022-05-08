import UserEntity from "@business-logic/User";
import { User } from "@prisma/client";

import { verifyPassword } from "@helpers/auth";
import NotFoundError from "@helpers/errors/NotFoundError";
import prisma from "@helpers/prisma";
import { createJob } from "@helpers/tests/createJob";
import { minimalSetup } from "@helpers/tests/setup";
import { teardown } from "@helpers/tests/teardown";

describe("User", () => {
  beforeEach(async () => {
    await teardown();
  });

  describe("#create", () => {
    // it("create user company name", async () => {
    //   const requestParams = {
    //     name: "Bashir",
    //     email: "bashir4@gmail.com",
    //     password: "1234567890",
    //   };

    //   const newCompanyName = await prisma.company.create({
    //     data: {
    //       name: requestParams.name,
    //     },
    //   });

    //   expect(newCompanyName).toBe(requestParams.name);
    // });

    it("creates a user", async () => {
      const { company } = await minimalSetup();

      const requestParams = {
        name: "Bashir",
        email: "bashir4@gmail.com",
        password: "1234567890",
      };

      const entity = new UserEntity();
      const result = await entity.create(requestParams);

      const foundUser: any = await prisma.user.findUnique({ where: { id: result.user.id } });

      expect(foundUser.name).toBe(requestParams.name);
      expect(foundUser.email).toBe(requestParams.email);
      expect(foundUser.companyId).not.toBeNull();
      const isVerified = verifyPassword(requestParams.password, foundUser.password);
      expect(isVerified).toBeTruthy();
    });

    it("throws error if email exist", async () => {
      await minimalSetup();

      const requestParams = {
        name: "Bashir",
        email: "john.doe@example.com",
        password: "1234567890",
      };

      const nonExistingUserId = 99999;
      const entity = new UserEntity();
      await expect(async () => {
        await entity.create(requestParams);
      }).rejects.toThrowError("Email address is already registered");
    });
  });

  describe("#user", () => {
    it("lists all users", async () => {
      await minimalSetup();
      await expect(async () => {
        await prisma.user.findMany();
      }).not.toEqual([]);
    });
    it("throw error if user is not found", async () => {
      await minimalSetup();
      await expect(async () => {
        await prisma.user.findUnique({
          where: { id: 938294839 },
          rejectOnNotFound: true,
        });
      }).rejects.toThrow(new NotFoundError("No User found"));
    });
  });
});
