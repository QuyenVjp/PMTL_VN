/**
 * CharityFirewall Interceptor Tests
 *
 * Tests: skip decorator, HTTP method filtering, violation detection, logging
 */

import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext, ForbiddenException, Inject } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { CharityFirewallInterceptor } from "./charity-firewall.interceptor.js";
import { CharityFirewallService } from "../services/charity-firewall.service.js";
import { SKIP_CHARITY_FIREWALL } from "../decorators/skip-charity-firewall.decorator.js";
import type { CallHandler } from "@nestjs/common";
import { of } from "rxjs";

describe("CharityFirewallInterceptor", () => {
  let interceptor: CharityFirewallInterceptor;
  let charityFirewallServiceMock: any;
  let reflectorMock: any;
  let loggerMock: any;

  beforeEach(async () => {
    charityFirewallServiceMock = {
      scanContent: jest.fn(),
    };

    reflectorMock = {
      get: jest.fn(),
    };

    loggerMock = {
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharityFirewallInterceptor,
        {
          provide: CharityFirewallService,
          useValue: charityFirewallServiceMock,
        },
        {
          provide: Reflector,
          useValue: reflectorMock,
        },
        {
          provide: Logger,
          useValue: loggerMock,
        },
      ],
    }).compile();

    interceptor = module.get<CharityFirewallInterceptor>(CharityFirewallInterceptor);
  });

  describe("HTTP method filtering", () => {
    it("should skip GET requests", async () => {
      const context = createMockContext("GET", "/posts/123", { title: "Test" });

      const callHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ success: true })),
      };

      reflectorMock.get.mockReturnValue(false);

      await interceptor.intercept(context, callHandler);

      // Service should not be called for GET
      expect(charityFirewallServiceMock.scanContent).not.toHaveBeenCalled();
      expect(callHandler.handle).toHaveBeenCalled();
    });

    it("should skip DELETE requests", async () => {
      const context = createMockContext("DELETE", "/posts/123", {});

      const callHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ success: true })),
      };

      reflectorMock.get.mockReturnValue(false);

      await interceptor.intercept(context, callHandler);

      expect(charityFirewallServiceMock.scanContent).not.toHaveBeenCalled();
      expect(callHandler.handle).toHaveBeenCalled();
    });

    it("should intercept POST requests", async () => {
      const context = createMockContext("POST", "/posts", { title: "Safe post" });

      const callHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ success: true })),
      };

      reflectorMock.get.mockReturnValue(false);
      charityFirewallServiceMock.scanContent.mockResolvedValue({
        userId: "user-123",
        contentType: "post",
        contentId: "test-id",
        text: "Safe post",
        detectedPatterns: [],
        hasViolation: false,
        userViolationCount: 0,
        escalatedToAlert: false,
      });

      await interceptor.intercept(context, callHandler);

      expect(charityFirewallServiceMock.scanContent).toHaveBeenCalled();
      expect(callHandler.handle).toHaveBeenCalled();
    });

    it("should intercept PUT requests", async () => {
      const context = createMockContext("PUT", "/posts/123", { title: "Updated" });

      const callHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ success: true })),
      };

      reflectorMock.get.mockReturnValue(false);
      charityFirewallServiceMock.scanContent.mockResolvedValue({
        userId: "user-123",
        contentType: "post",
        contentId: "test-id",
        text: "Safe post",
        detectedPatterns: [],
        hasViolation: false,
        userViolationCount: 0,
        escalatedToAlert: false,
      });

      await interceptor.intercept(context, callHandler);

      expect(charityFirewallServiceMock.scanContent).toHaveBeenCalled();
    });

    it("should intercept PATCH requests", async () => {
      const context = createMockContext("PATCH", "/posts/123", { title: "Patched" });

      const callHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ success: true })),
      };

      reflectorMock.get.mockReturnValue(false);
      charityFirewallServiceMock.scanContent.mockResolvedValue({
        userId: "user-123",
        contentType: "post",
        contentId: "test-id",
        text: "Safe post",
        detectedPatterns: [],
        hasViolation: false,
        userViolationCount: 0,
        escalatedToAlert: false,
      });

      await interceptor.intercept(context, callHandler);

      expect(charityFirewallServiceMock.scanContent).toHaveBeenCalled();
    });
  });

  describe("Skip decorator", () => {
    it("should skip firewall check when @SkipCharityFirewall() is applied", async () => {
      const context = createMockContext("POST", "/admin/posts", { title: "Admin post" });

      const callHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ success: true })),
      };

      // Simulate @SkipCharityFirewall() decorator
      reflectorMock.get.mockReturnValue(true);

      await interceptor.intercept(context, callHandler);

      expect(charityFirewallServiceMock.scanContent).not.toHaveBeenCalled();
      expect(callHandler.handle).toHaveBeenCalled();
    });
  });

  describe("Empty body handling", () => {
    it("should allow request with empty body", async () => {
      const context = createMockContext("POST", "/posts", {});

      const callHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ success: true })),
      };

      reflectorMock.get.mockReturnValue(false);

      await interceptor.intercept(context, callHandler);

      // No text to scan, service should not be called
      expect(charityFirewallServiceMock.scanContent).not.toHaveBeenCalled();
      expect(callHandler.handle).toHaveBeenCalled();
    });

    it("should allow request with non-text body", async () => {
      const context = createMockContext("POST", "/posts", {
        number: 123,
        flag: true,
      });

      const callHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ success: true })),
      };

      reflectorMock.get.mockReturnValue(false);

      await interceptor.intercept(context, callHandler);

      expect(charityFirewallServiceMock.scanContent).not.toHaveBeenCalled();
      expect(callHandler.handle).toHaveBeenCalled();
    });
  });

  describe("Violation detection", () => {
    it("should throw ForbiddenException when violation detected", async () => {
      const context = createMockContext("POST", "/posts", {
        title: "Hello",
        description: "STK: 10234567890",
      });

      const callHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ success: true })),
      };

      reflectorMock.get.mockReturnValue(false);
      charityFirewallServiceMock.scanContent.mockResolvedValue({
        userId: "user-123",
        contentType: "post",
        contentId: "test-id",
        text: "Hello STK: 10234567890",
        detectedPatterns: [
          {
            type: "VN_ACCOUNT",
            matchedText: "10234567890",
            confidence: "HIGH",
          },
        ],
        hasViolation: true,
        userViolationCount: 1,
        escalatedToAlert: false,
      });

      await expect(interceptor.intercept(context, callHandler)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(interceptor.intercept(context, callHandler)).rejects.toThrow(
        "Nội dung chứa thông tin tài khoản ngân hàng không được phép",
      );

      // Should log the violation
      expect(loggerMock.warn).toHaveBeenCalled();
      expect(callHandler.handle).not.toHaveBeenCalled();
    });

    it("should allow request with no violations", async () => {
      const context = createMockContext("POST", "/posts", {
        title: "Safe Title",
        description: "This is a completely safe description with no numbers",
      });

      const callHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ success: true })),
      };

      reflectorMock.get.mockReturnValue(false);
      charityFirewallServiceMock.scanContent.mockResolvedValue({
        userId: "user-123",
        contentType: "post",
        contentId: "test-id",
        text: "Safe post",
        detectedPatterns: [],
        hasViolation: false,
        userViolationCount: 0,
        escalatedToAlert: false,
      });

      await interceptor.intercept(context, callHandler);

      expect(charityFirewallServiceMock.scanContent).toHaveBeenCalled();
      expect(callHandler.handle).toHaveBeenCalled();
      expect(loggerMock.warn).not.toHaveBeenCalled();
    });
  });

  describe("Nested object scanning", () => {
    it("should scan nested text fields", async () => {
      const context = createMockContext("POST", "/posts", {
        title: "Post Title",
        metadata: {
          description: "STK: 9876543210",
          tags: ["finance", "accounting"],
        },
      });

      const callHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ success: true })),
      };

      reflectorMock.get.mockReturnValue(false);
      charityFirewallServiceMock.scanContent.mockResolvedValue({
        userId: "user-123",
        contentType: "post",
        contentId: "test-id",
        text: "Post Title STK: 9876543210 finance accounting",
        detectedPatterns: [
          {
            type: "VN_ACCOUNT",
            matchedText: "9876543210",
            confidence: "HIGH",
          },
        ],
        hasViolation: true,
        userViolationCount: 1,
        escalatedToAlert: false,
      });

      await expect(interceptor.intercept(context, callHandler)).rejects.toThrow(
        ForbiddenException,
      );

      // Verify scanContent was called with combined text
      const callArgs = charityFirewallServiceMock.scanContent.mock.calls[0];
      expect(callArgs[3]).toContain("STK: 9876543210");
    });

    it("should scan array of objects", async () => {
      const context = createMockContext("POST", "/comments", {
        comments: [
          { text: "Great post", author: "user1" },
          { text: "My STK: 1234567890", author: "user2" },
        ],
      });

      const callHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ success: true })),
      };

      reflectorMock.get.mockReturnValue(false);
      charityFirewallServiceMock.scanContent.mockResolvedValue({
        userId: "user-123",
        contentType: "comment",
        contentId: "test-id",
        text: "Great post user1 My STK: 1234567890 user2",
        detectedPatterns: [
          {
            type: "VN_ACCOUNT",
            matchedText: "1234567890",
            confidence: "HIGH",
          },
        ],
        hasViolation: true,
        userViolationCount: 1,
        escalatedToAlert: false,
      });

      await expect(interceptor.intercept(context, callHandler)).rejects.toThrow(
        ForbiddenException,
      );

      // Verify all text was scanned
      const callArgs = charityFirewallServiceMock.scanContent.mock.calls[0];
      expect(callArgs[3]).toContain("My STK: 1234567890");
    });
  });

  describe("Error handling", () => {
    it("should log and allow request if scan throws non-Forbidden error", async () => {
      const context = createMockContext("POST", "/posts", {
        title: "Test",
      });

      const callHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ success: true })),
      };

      reflectorMock.get.mockReturnValue(false);
      charityFirewallServiceMock.scanContent.mockRejectedValue(
        new Error("Database error"),
      );

      const observable = await interceptor.intercept(context, callHandler);

      expect(loggerMock.error).toHaveBeenCalled();
      expect(callHandler.handle).toHaveBeenCalled();
    });

    it("should re-throw ForbiddenException from service", async () => {
      const context = createMockContext("POST", "/posts", {
        title: "Test",
      });

      const callHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ success: true })),
      };

      reflectorMock.get.mockReturnValue(false);
      charityFirewallServiceMock.scanContent.mockRejectedValue(
        new ForbiddenException("Manual violation"),
      );

      await expect(interceptor.intercept(context, callHandler)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("Content type detection", () => {
    it("should detect content type from URL path", async () => {
      const context = createMockContext("POST", "/api/posts/create", {
        title: "Safe post",
      });

      const callHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ success: true })),
      };

      reflectorMock.get.mockReturnValue(false);
      charityFirewallServiceMock.scanContent.mockResolvedValue({
        userId: "user-123",
        contentType: "post",
        contentId: "test-id",
        text: "Safe post",
        detectedPatterns: [],
        hasViolation: false,
        userViolationCount: 0,
        escalatedToAlert: false,
      });

      await interceptor.intercept(context, callHandler);

      const callArgs = charityFirewallServiceMock.scanContent.mock.calls[0];
      expect(callArgs[1]).toBe("post");
    });

    it("should detect comment content type", async () => {
      const context = createMockContext("POST", "/api/comments", {
        text: "Nice comment",
      });

      const callHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ success: true })),
      };

      reflectorMock.get.mockReturnValue(false);
      charityFirewallServiceMock.scanContent.mockResolvedValue({
        userId: "user-123",
        contentType: "post",
        contentId: "test-id",
        text: "Safe post",
        detectedPatterns: [],
        hasViolation: false,
        userViolationCount: 0,
        escalatedToAlert: false,
      });

      await interceptor.intercept(context, callHandler);

      const callArgs = charityFirewallServiceMock.scanContent.mock.calls[0];
      expect(callArgs[1]).toBe("comment");
    });
  });

  describe("User identification", () => {
    it("should use authenticated user ID", async () => {
      const context = createMockContext("POST", "/posts", { title: "Test" }, {
        id: "user-123",
        email: "user@example.com",
      });

      const callHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ success: true })),
      };

      reflectorMock.get.mockReturnValue(false);
      charityFirewallServiceMock.scanContent.mockResolvedValue({
        userId: "user-123",
        contentType: "post",
        contentId: "test-id",
        text: "Safe post",
        detectedPatterns: [],
        hasViolation: false,
        userViolationCount: 0,
        escalatedToAlert: false,
      });

      await interceptor.intercept(context, callHandler);

      const callArgs = charityFirewallServiceMock.scanContent.mock.calls[0];
      expect(callArgs[0]).toBe("user-123");
    });

    it("should use anonymous for unauthenticated requests", async () => {
      const context = createMockContext("POST", "/posts", { title: "Test" }, undefined);

      const callHandler: CallHandler = {
        handle: jest.fn().mockReturnValue(of({ success: true })),
      };

      reflectorMock.get.mockReturnValue(false);
      charityFirewallServiceMock.scanContent.mockResolvedValue({
        userId: "user-123",
        contentType: "post",
        contentId: "test-id",
        text: "Safe post",
        detectedPatterns: [],
        hasViolation: false,
        userViolationCount: 0,
        escalatedToAlert: false,
      });

      await interceptor.intercept(context, callHandler);

      const callArgs = charityFirewallServiceMock.scanContent.mock.calls[0];
      expect(callArgs[0]).toBe("anonymous");
    });
  });
});

/**
 * Helper to create mock ExecutionContext with HTTP request
 */
function createMockContext(
  method: string,
  path: string,
  body: unknown,
  user?: any,
): ExecutionContext {
  const request = {
    method,
    path,
    url: path,
    body,
    user,
    headers: {
      "x-request-id": "req-123",
    },
  };

  const context = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
    }),
    getHandler: jest.fn(),
  };

  return context as unknown as ExecutionContext;
}
