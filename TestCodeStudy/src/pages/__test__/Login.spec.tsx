import "@testing-library/jest-dom";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "../LoginPage.tsx";
import useLogin from "../../hooks/useLogin.ts";
import nock from "nock";

const queryClient = new QueryClient({
  defaultOptions: {},
});

describe("로그인 테스트", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  // 콘솔에러가 찍히게 되면 아무것도 하지말아라
  afterAll(() => {
    jest.restoreAllMocks();
  });

  //모든 것이 끝나면 다시 복구

  test("로그인에 실패하면 에러메세지가 나타난다", async () => {
    //given -로그인 화면이 그려진다.
    const routes = [
      {
        path: "/login",
        element: <LoginPage />,
      },
    ];

    const router = createMemoryRouter(routes, {
      initialEntries: ["/login"],
      initialIndex: 0,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );

    // when -사용자가 로그인에 실패한다.

    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    nock("https://inflearn.byeongjinkang.com")
      .post(`/user/login`, {
        email: "wrong@email.com",
        password: "wrongPassword",
      })
      .reply(400, { msg: "SUCH_USER_DOES_NOT_EXIST" });

    const emailInput = screen.getByLabelText("이메일");
    const passwordInput = screen.getByLabelText("비밀번호");

    fireEvent.change(emailInput, {
      target: { value: "wrong@email.com" },
    });
    fireEvent.change(passwordInput, { target: { value: "wrongPassword" } });
    const loginButton = screen.getByRole("button", { name: "로그인" });
    fireEvent.click(loginButton);

    const { result } = renderHook(() => useLogin(), {
      wrapper,
    });

    //then -에레메세지가 나타난다.

    await waitFor(() => expect(result.current.isError));
    const errorMessage = await screen.findByTestId("error-message");
    expect(errorMessage).toBeInTheDocument();
  });
});
