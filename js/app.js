/* Student Registration Form with Input Validation */

/* ---------- Pure validation functions (no DOM access) ---------- */

var STUDENT_NUMBER_PATTERN = /^\d{2}-\d{4}-\d{3}$/;
var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var MOBILE_PATTERN = /^(09|\+639)\d{9}$/;
var PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!])\S{8,}$/;

function isValidStudentNumber(value) {
  if (typeof value !== "string") return false;
  return STUDENT_NUMBER_PATTERN.test(value.trim());
}

function isValidPassword(value) {
  if (typeof value !== "string") return false;
  return PASSWORD_PATTERN.test(value); // passwords are never trimmed
}

function isValidEmail(value) {
  return typeof value === "string" && EMAIL_PATTERN.test(value.trim());
}

function isValidMobile(value) {
  return typeof value === "string" && MOBILE_PATTERN.test(value.trim());
}

function passwordProblems(value) {
  var problems = [];
  if (value.length < 8) problems.push("at least 8 characters");
  if (!/[A-Z]/.test(value)) problems.push("one uppercase letter");
  if (!/\d/.test(value)) problems.push("one digit");
  if (!/[@$!]/.test(value)) problems.push("one of @, $, or !");
  if (/\s/.test(value)) problems.push("no spaces");
  return problems;
}

/* ---------- Browser-only code ---------- */

if (typeof document !== "undefined") {
  (function () {
    var $ = function (id) { return document.getElementById(id); };

    var form = $("registrationForm");
    var fields = {
      fullName: $("fullName"),
      studentNumber: $("studentNumber"),
      email: $("email"),
      mobileNumber: $("mobileNumber"),
      password: $("password"),
      confirmPassword: $("confirmPassword"),
      course: $("course"),
      terms: $("terms")
    };

    var checks = {
      fullName: function () {
        var v = fields.fullName.value.trim();
        if (v.length === 0) return "Enter your full name.";
        if (v.length < 2) return "Full name must be at least 2 characters.";
        return "";
      },
      studentNumber: function () {
        var v = fields.studentNumber.value.trim();
        if (v === "") return "Enter your student number.";
        if (!isValidStudentNumber(v)) return "Enter a student number in the format 24-1234-123.";
        return "";
      },
      email: function () {
        var v = fields.email.value.trim();
        if (v === "") return "Enter your email address.";
        if (!isValidEmail(v)) return "Enter an email like name@example.com (no spaces, domain must contain a dot).";
        return "";
      },
      mobileNumber: function () {
        var v = fields.mobileNumber.value.trim();
        if (v === "") return "Enter your mobile number.";
        if (!isValidMobile(v)) return "Enter 09 or +639 followed by nine digits, with no spaces or hyphens.";
        return "";
      },
      password: function () {
        var v = fields.password.value;
        if (v === "") return "Enter a password.";
        if (!isValidPassword(v)) return "Password needs " + passwordProblems(v).join(", ") + ".";
        return "";
      },
      confirmPassword: function () {
        var v = fields.confirmPassword.value;
        if (v === "") return "Confirm your password.";
        if (v !== fields.password.value) return "Passwords do not match.";
        return "";
      },
      course: function () {
        var v = fields.course.value;
        if (v !== "BSIT" && v !== "BSCS") return "Select BSIT or BSCS.";
        return "";
      },
      terms: function () {
        return fields.terms.checked ? "" : "You must agree to the terms to register.";
      }
    };

    function showError(name, message) {
      var el = fields[name];
      var err = $(name + "Error");
      err.textContent = message;
      el.setAttribute("aria-invalid", message ? "true" : "false");
    }

    function validateField(name) {
      var message = checks[name]();
      showError(name, message);
      return message === "";
    }

    function updatePasswordFeedback() {
      var fb = $("passwordFeedback");
      var v = fields.password.value;
      fb.className = "feedback";
      if (v === "") { fb.textContent = ""; return; }
      var problems = passwordProblems(v);
      if (problems.length === 0) {
        fb.textContent = "Password meets all requirements.";
        fb.classList.add("ok");
      } else {
        fb.textContent = "Still needed: " + problems.join(", ") + ".";
        fb.classList.add("bad");
      }
    }

    function clearOutput() {
      var msg = $("successMessage");
      msg.textContent = "";
      msg.hidden = true;
      $("registrationSummary").hidden = true;
      ["summaryName", "summaryStudentNumber", "summaryEmail",
       "summaryMobileNumber", "summaryCourse"].forEach(function (id) {
        $(id).textContent = "";
      });
    }

    function showSummary() {
      $("summaryName").textContent = fields.fullName.value.trim();
      $("summaryStudentNumber").textContent = fields.studentNumber.value.trim();
      $("summaryEmail").textContent = fields.email.value.trim();
      $("summaryMobileNumber").textContent = fields.mobileNumber.value.trim();
      $("summaryCourse").textContent = fields.course.value;
      var msg = $("successMessage");
      msg.textContent = "Registration details validated successfully!";
      msg.hidden = false;
      $("registrationSummary").hidden = false;
    }

    /* submit */
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var allValid = true;
      Object.keys(checks).forEach(function (name) {
        if (!validateField(name)) allValid = false;
      });
      updatePasswordFeedback();
      if (allValid) {
        showSummary();
      } else {
        clearOutput();
        var firstBad = form.querySelector('[aria-invalid="true"]');
        if (firstBad) firstBad.focus();
      }
    });

    /* input: live password feedback (and re-check confirm if it has a value) */
    fields.password.addEventListener("input", function () {
      updatePasswordFeedback();
      if (fields.password.getAttribute("aria-invalid") === "true") validateField("password");
      if (fields.confirmPassword.value !== "") validateField("confirmPassword");
    });

    /* blur: full name */
    fields.fullName.addEventListener("blur", function () {
      validateField("fullName");
    });

    /* change: course and terms */
    fields.course.addEventListener("change", function () { validateField("course"); });
    fields.terms.addEventListener("change", function () { validateField("terms"); });

    /* clear an error as soon as the user fixes that field */
    ["fullName", "studentNumber", "email", "mobileNumber", "confirmPassword"].forEach(function (name) {
      fields[name].addEventListener("input", function () {
        if (fields[name].getAttribute("aria-invalid") === "true") validateField(name);
      });
    });

    /* reset */
    form.addEventListener("reset", function () {
      Object.keys(fields).forEach(function (name) {
        $(name + "Error").textContent = "";
        fields[name].setAttribute("aria-invalid", "false");
      });
      var fb = $("passwordFeedback");
      fb.textContent = "";
      fb.className = "feedback";
      clearOutput();
    });
  })();
}

/* ---------- Export for Node-based autograder ---------- */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { isValidStudentNumber: isValidStudentNumber, isValidPassword: isValidPassword };
}