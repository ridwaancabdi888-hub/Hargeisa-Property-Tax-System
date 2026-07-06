import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import ProtectedRoute from "../ProtectedRoute";
import { useAuth } from "../../../context/AuthContext";

vi.mock("../../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

function renderAt(path: string, allowedRoles?: ("admin" | "agent" | "viewer")[]) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<div>Sign In Page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
        <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  test("shows a loading state while auth is resolving", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, isLoading: true } as never);
    renderAt("/protected");
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("redirects to / when there is no authenticated user", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, isLoading: false } as never);
    renderAt("/protected");
    expect(screen.getByText("Sign In Page")).toBeInTheDocument();
  });

  test("renders the protected content for an authenticated user", () => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: 1, role: "admin" }, isLoading: false } as never);
    renderAt("/protected");
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  test("redirects to /unauthorized when the user's role isn't allowed", () => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: 1, role: "viewer" }, isLoading: false } as never);
    renderAt("/protected", ["admin"]);
    expect(screen.getByText("Unauthorized Page")).toBeInTheDocument();
  });

  test("allows access when the user's role is in allowedRoles", () => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: 1, role: "admin" }, isLoading: false } as never);
    renderAt("/protected", ["admin", "agent"]);
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
