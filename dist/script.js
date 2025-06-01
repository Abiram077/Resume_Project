function toggleSidebar() {
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const isOpen = sidebar.classList.contains('translate-x-0');

    sidebar.classList.toggle('translate-x-full');
    sidebar.classList.toggle('translate-x-0');
    overlay.classList.toggle('hidden');
  }

  document.addEventListener("DOMContentLoaded", () => {
    const avatarBtn = document.getElementById("avatarButton");
    const dropdown = document.getElementById("userDropdown");

    // Toggle dropdown
    avatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = dropdown.classList.contains("hidden");
      dropdown.classList.toggle("hidden", !isHidden);
      dropdown.classList.toggle("fixed", isHidden);
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      const clickedInside = avatarBtn.contains(e.target) || dropdown.contains(e.target);
      if (!clickedInside) {
        dropdown.classList.add("hidden");
        dropdown.classList.remove("fixed");
      }
    });
  });

  function showLoadingOverlay(fileSizeMB) {
  hasError = false; // reset flag
  const modal = document.getElementById("loadingModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex")
  document.getElementById("fileSizeText").textContent = `Uploaded File Size: ${fileSizeMB.toFixed(2)} MB`;

  document.getElementById("spinnerIcon").classList = "animate-spin h-6 w-6 text-pink-500";
  document.getElementById("statusMessage").textContent = "Generating your PDF...";
  document.getElementById("errorSection").classList.add("hidden");
  document.getElementById("downloadSection").classList.add("hidden");

  // Reset step classes
  ["step1", "step2", "step3"].forEach((id, i) => {
    const el = document.getElementById(id);
    el.classList.remove("text-green-400", "text-pink-400", "text-red-400");
    el.classList.add(i === 0 ? "text-pink-400" : "text-gray-500");
    el.textContent = `${i + 1}. ${el.textContent.split('. ')[1] || 'Step'}`;
  });

  updateStepStatus(0);
}

function updateStepStatus(index, error = null, downloadURL = null) {
  const steps = ["step1", "step2", "step3"];

  if (hasError) return;

  if (index > 0) {
    document.getElementById(steps[index - 1]).classList.replace("text-pink-400", "text-green-400");
  }

  if (error) {
    hasError = true;
    document.getElementById("spinnerIcon").outerHTML = `<div class="text-red-500 text-3xl">❌</div>`;
    document.getElementById("statusMessage").textContent = "Something went wrong.";
    document.getElementById(steps[index]).classList.replace("text-pink-400", "text-red-400");
    document.getElementById(steps[index]).textContent += ` — ${error}`;
    document.getElementById("errorText").textContent = error;
    document.getElementById("errorSection").classList.remove("hidden");
    return;
  }

  document.getElementById(steps[index]).classList.replace("text-gray-500", "text-pink-400");

  if (index === steps.length - 1) {
    setTimeout(() => {
      if (hasError) return;
      document.getElementById("spinnerIcon").outerHTML = `<div class="text-green-400 text-2xl">✅</div>`;
      document.getElementById("statusMessage").textContent = "Your PDF is ready!";
      document.getElementById("downloadSection").classList.remove("hidden");
      document.getElementById("downloadLink").href = downloadURL || "#";
    }, 1500);
  } else {
    setTimeout(() => {
      if (!hasError) updateStepStatus(index + 1, null, downloadURL);
    }, 1500);
  }
}

 // testing
 function fakeSubmit() {
  const file = document.getElementById("dropzone-file").files[0];
  const prompt = document.getElementById("promptInput").value;

  if (!file || !prompt.trim()) {
    alert("Please upload a file and enter a prompt.");
    return;
  }

  const sizeMB = file.size / (1024 * 1024);
  document.getElementById("fileSizeDisplay").textContent = `${sizeMB.toFixed(2)} MB`;

  const progressContainer = document.getElementById("uploadProgressContainer");
  const progressBar = document.getElementById("uploadProgressBar");

  progressContainer.classList.remove("hidden");
  progressBar.style.width = "0%";

  let progress = 0;

  // Simulate progress
  const interval = setInterval(() => {
    progress += Math.random() * 10;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);

      showLoadingOverlay(sizeMB); // show modal
      setTimeout(() => {
        if (file.size < 1000) {
          updateStepStatus(1, "File is too small or empty.");
        }
      }, 2000);
    }
    progressBar.style.width = `${progress}%`;
  }, 150);

  setTimeout(() => {
  progressContainer.classList.add("hidden");
}, 2000);
}
