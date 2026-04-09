import { describe, expect, it } from "vitest";
import { connectors, department, jobs, roles, skills } from "../src";

describe("@uos/department-social-media", () => {
  it("captures the social media department boundary", () => {
    expect(department.departmentId).toBe("social-media");
    expect(department.parentFunctionId).toBe("growth");
    expect(department.moduleId).toBe("autonomous-social-media");
  });

  it("includes the social leadership, channel, and review roles", () => {
    expect(roles.some((role) => role.roleKey === "growth-social-content-lead")).toBe(true);
    expect(roles.some((role) => role.roleKey === "growth-x-publisher-specialist")).toBe(true);
    expect(roles.some((role) => role.roleKey === "growth-brand-safety-reviewer")).toBe(true);
    expect(jobs.map((job) => job.jobKey)).toEqual([
      "social-daily-optimization-loop",
      "social-weekly-content-planning-review",
    ]);
  });

  it("keeps social skill bundles and channel toolkit mappings together", () => {
    expect(skills.bundleIds).toContain("uos-social-content");
    expect(skills.externalSkills.some((skill) => skill.id === "uos-external-social-content")).toBe(true);
    expect(connectors.requiredToolkits).toContain("x");
    expect(connectors.requiredToolkits).toContain("instagram");
    expect(connectors.roleToolkits.some((role) => role.roleKey === "growth-youtube-publisher-specialist")).toBe(true);
  });
});
