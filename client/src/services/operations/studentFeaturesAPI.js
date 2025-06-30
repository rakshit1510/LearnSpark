import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";
import rzpLogo from "../../assets/Logo/rzp_logo.png";
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";

const {
  COURSE_PAYMENT_API,
  COURSE_VERIFY_API,
  SEND_PAYMENT_SUCCESS_EMAIL_API,
} = studentEndpoints;

// Load Razorpay SDK
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Buy Course
export async function buyCourse(token, coursesId, userDetails, navigate, dispatch) {
  const toastId = toast.loading("Loading...");
  try {
    const isLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!isLoaded) {
      toast.error("Razorpay SDK failed to load");
      toast.dismiss(toastId);
      return;
    }

    const orderResponse = await apiConnector(
      "POST",
      COURSE_PAYMENT_API,
      { coursesId },
      { Authorization: `Bearer ${token}` }
    );
    const statusCode = orderResponse?.data?.statusCode
    if ((statusCode !== 200 && statusCode !== 201)) {
      throw new Error(orderResponse?.data?.message || "Order creation failed");
    }
    console.log("response",orderResponse)     
    const RAZORPAY_KEY = import.meta.env.VITE_APP_RAZORPAY_KEY;

    const options = {
      key: RAZORPAY_KEY,
      currency: orderResponse.data.message.currency,
      amount: orderResponse.data.message.amount,
      order_id: orderResponse.data.message.id,
      name: "LearnSpark",
      description: "Thank You for Purchasing the Course",
      image: rzpLogo,
      prefill: {
        name: userDetails.firstName,
        email: userDetails.email,
      },
      handler: function (response) {
        sendPaymentSuccessEmail(response, orderResponse.data.message.amount, token);
        verifyPayment({ ...response, coursesId }, token, navigate, dispatch);
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();

    paymentObject.on("payment.failed", function (response) {
      toast.error("Oops, payment failed");
      console.log("Payment failed:", response.error);
    });
  } catch (error) {
    console.log("PAYMENT ERROR:", error);
    toast.error(error?.response?.data?.message || "Payment process failed");
  } finally {
    toast.dismiss(toastId);
  }
}

// Send Payment Success Email
async function sendPaymentSuccessEmail(response, amount, token) {
  try {
    await apiConnector(
      "POST",
      SEND_PAYMENT_SUCCESS_EMAIL_API,
      {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        amount,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    );
  } catch (error) {
    console.log("EMAIL ERROR:", error);
  }
}

// Verify Payment
async function verifyPayment(bodyData, token, navigate, dispatch) {
  const toastId = toast.loading("Verifying payment...");
  dispatch(setPaymentLoading(true));

  try {
    const response = await apiConnector(
      "POST",
      COURSE_VERIFY_API,
      bodyData,
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Payment verification failed");
    }

    toast.success("Payment successful! You have been enrolled.");
    dispatch(resetCart());
    navigate("/dashboard/enrolled-courses");
  } catch (error) {
    console.log("VERIFICATION ERROR:", error);
    toast.error(error?.response?.data?.message || "Could not verify payment");
  } finally {
    toast.dismiss(toastId);
    dispatch(setPaymentLoading(false));
  }
}
