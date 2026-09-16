import { o as __toESM } from "../_runtime.mjs";
import { _ as Link, y as require_jsx_runtime, z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-B40BzJxt.mjs";
import { t as GROK_PROVIDERS } from "./server-DrcDvxwU.mjs";
import { t as SignInGate } from "./gates-p-7fXblz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-CL5nzWYs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center px-4 py-10",
		style: {
			background: "#04100c",
			color: "#f8f4e9"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-[11px] uppercase tracking-[0.2em] opacity-70",
					children: "الميزان"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-center font-serif text-3xl",
					children: "Вход в кабинет"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-sm opacity-70",
					children: "Два часа открыты всем. Дальше — аккаунт. Прогресс на сервере."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SignInGate, {
					fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginForm, {}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-sm",
						children: "Ты уже внутри."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "block rounded-full bg-[#f0cf7a] py-3 text-center text-[#04100c]",
						children: "Домой"
					})]
				})
			]
		})
	});
}
function LoginForm() {
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [mode, setMode] = (0, import_react.useState)("in");
	const [err, setErr] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onMail(e) {
		e.preventDefault();
		setErr("");
		setBusy(true);
		try {
			if (mode === "up") {
				const r = await authClient.signUp.email({
					email,
					password,
					name: email.split("@")[0] ?? "student",
					callbackURL: "/"
				});
				if (r.error) throw new Error(r.error.message);
			} else {
				const r = await authClient.signIn.email({
					email,
					password,
					callbackURL: "/"
				});
				if (r.error) throw new Error(r.error.message);
			}
			window.location.href = "/";
		} catch (e) {
			setErr(e instanceof Error ? e.message : "Не вышло");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3",
		children: [
			GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => signIn(p.providerId, { callbackURL: "/" }),
				className: "min-h-12 rounded-full border border-[#f0cf7a]/30 px-4",
				children: p.idp === "google" ? "Войти через Google" : "Войти через X"
			}, p.providerId)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-[11px] opacity-50",
				children: "Почта — свой пароль на этом сервере"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-2",
				onSubmit: onMail,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "min-h-12 rounded-2xl border border-[#f0cf7a]/20 bg-transparent px-3",
						type: "email",
						required: true,
						placeholder: "Почта",
						value: email,
						onChange: (e) => setEmail(e.target.value),
						autoComplete: "email"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "min-h-12 rounded-2xl border border-[#f0cf7a]/20 bg-transparent px-3",
						type: "password",
						required: true,
						minLength: 8,
						placeholder: "Пароль, от 8 знаков",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						autoComplete: mode === "up" ? "new-password" : "current-password"
					}),
					err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-[#ff8b82]",
						children: err
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: busy,
						className: "min-h-12 rounded-full bg-[#f0cf7a] text-[#04100c]",
						children: mode === "up" ? "Создать кабинет" : "Войти почтой"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-sm opacity-70",
				onClick: () => setMode(mode === "up" ? "in" : "up"),
				children: mode === "up" ? "Уже есть кабинет" : "Нет кабинета — создать"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-[11px] opacity-50",
				children: "Telegram на этой платформе нельзя. Почта или Google."
			})
		]
	});
}
//#endregion
export { Login as component };
