import { Show, createSignal } from "solid-js";

import Button from "~components/Button/Button";
import RadioGroup from "~components/RadioGroup/RadioGroup";
import Input from "~components/Forms/Input/Input";

import t from "~utils/messages";
import {
	SUBMIT_PRODUCT_ACTION,
	SUBMIT_PRODUCT_FORM,
} from "~constants/documents";
import {
	PRODUCT_TYPE_OPTIONS,
	arabicLettersRegex,
	englishLettersRegex,
} from "~constants/submit";

import { Status } from "~types";

import styles from "./index.module.scss";

import LoadingIcon from "~assets/icons/loading.svg?component-solid";

export default function Submit() {
	const [state, setState] = createSignal<{
		status: "idle" | "submitting" | "error" | "submitted";
		context?: string;
	}>({
		status: "idle",
	});

	const [type, setType] = createSignal<Status>("boycott");

	const handleSubmit = async (ev: SubmitEvent) => {
		ev.preventDefault();

		setState({
			status: "submitting",
		});

		const form = ev.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		try {
			const response = await fetch(SUBMIT_PRODUCT_ACTION, {
				method: "POST",
				body: data,
			});

			const json = await response.json();

			if (json.error) {
				return setState({
					status: "error",
					context: json.error,
				});
			}

			setState({
				status: "submitted",
			});

			form.reset();
		} catch (error) {
			setState({
				status: "error",
				context: "NETWORK_ERROR",
			});
		}
	};

	const handleFormChange = (ev: Event) => {
		const target = ev.currentTarget as HTMLFormElement;
		const data = new FormData(target);

		setType((data.get("type") as Status) || "boycott");
	};

	const handleSetCustomValidity = (message: string) => (ev: Event) => {
		const target = ev.currentTarget as HTMLInputElement;

		target.setCustomValidity(message);
	};

	const handleClearCustomValidity = (ev: Event) => {
		const target = ev.currentTarget as HTMLInputElement;

		target.setCustomValidity("");
	};

	const status = () => state().status;
	const context = () => state().context;

	return (
		<>
			<section class={styles.container}>
				<div class={styles.body}>
					<h1 class="title">أضِف مُنْتَج لِبَديل</h1>

					<p>
						برجاء العلم ان تقديمك لهذا الإستبيان لا يضمن أن يتم إدراج المُنتج او
						الشركة التي قمت بإضافتها. فريق بديل يقوم بمراجعة جميع الأدلة بدرجة
						عالية من الإهتمام ومن الممكن أن يكون الدليل المُقدَّم غير كافي. تقع
						على عاتُقنا مسؤولية كبيرة أمام اللُّه ومستخدمين بديل ولذلك نتوخى
						الحذر قبل إضافة أي مُنتَج. شكراً لتفهمِكم.
					</p>

					<form
						onSubmit={handleSubmit}
						class={styles.form}
						onChange={handleFormChange}
						onReset={handleFormChange}
					>
						<RadioGroup
							name="type"
							label={t("submit.type")}
							items={PRODUCT_TYPE_OPTIONS}
							id="type"
							checked={type()}
							required
						/>

						<Input
							name="name"
							label="إسم المنتج بالعربية"
							type="text"
							autocomplete="off"
							placeholder="مثال: بيبسي"
							onInvalid={handleSetCustomValidity(
								"رجاء إدخال اسم مُنتج باللغة العربية بدون تشكيل"
							)}
							onInput={handleClearCustomValidity}
							pattern={arabicLettersRegex.source.toString()}
							required
						/>

						<Input
							label="إسم المنتج بالإنجليزية"
							name="english"
							type="text"
							autocomplete="off"
							placeholder="مثال: Pepsi"
							onInvalid={handleSetCustomValidity(
								"رجاء إدخال اسم مُنتج باللغة الإنجليزية بدون أحرف غريبة"
							)}
							onInput={handleClearCustomValidity}
							pattern={englishLettersRegex.source.toString()}
						/>

						<Input
							label="الشركة المصنعة"
							name="manufacturer"
							type="text"
							autocomplete="off"
							placeholder="اسم الشركة المُصنّعة او المالكة"
							required
						/>

						<Input
							as="textarea"
							label={type() === "boycott" ? "الإثبات/السبب" : "تفاصيل"}
							name="details"
							autocomplete="off"
							required
							minLength={5}
						/>

						<Button
							type="submit"
							variant="default"
							class={styles.submit}
							disabled={status() === "submitting"}
							data-status={status()}
						>
							{status() === "submitting" ? "يجري الإرسال" : "إرسال"}
							<LoadingIcon />
						</Button>
					</form>

					<Show
						when={
							status() === "error" &&
							[undefined, "SERVER_ERROR", "INVALID_SUBMISSION"].includes(
								context()
							)
						}
					>
						<p class="error" role="alert">
							حدث خطأ أثناء تسجيل المُنتج. أعد المحاولة. إذا فشل التسجيل مجدداً
							برجاء التوجه الى{" "}
							<a href={SUBMIT_PRODUCT_FORM} target="_blank">
								إستبيان جووجل فورم
							</a>{" "}
							الخاص بنا وملء التفاصيل هناك. نعتذر لكم على هذا الإزعاج.
						</p>
					</Show>

					<Show when={status() === "error" && context() === "NETWORK_ERROR"}>
						<p class="error" role="alert">
							حدث خطأ أثناء تسجيل المُنتج. برجاء التأكد من إتصالك بالإنترنت وعدم
							حجب المتصفح الخاص بِك الإتصال بمواقع جووجل من خلالنا.
						</p>
					</Show>

					<Show when={status() === "submitted"}>
						<p class="success" role="alert">
							تم إرسال المُنتج بنجاح. سيقوم فريق بَدِيل بمراجعة البيانات والتأكد
							من صحتها ثم إضافة هذا المُنتَج للموقع في حالة ثبوت صحة البيانات.
						</p>
					</Show>
				</div>
			</section>
		</>
	);
}
