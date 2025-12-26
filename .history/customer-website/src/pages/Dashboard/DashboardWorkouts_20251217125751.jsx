{/* Progress Modal */}
      <AnimatePresence>
        {showProgress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowProgress(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md p-3 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold">Progress Overview</h3>
                <button onClick={() => setShowProgress(false)} className="text-gray-500 p-2">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col items-center mt-6">
                <Progress type="circle" percent={progressPercentage} width={120} strokeColor={THEME} />
                <div className="text-gray-600 mt-3 text-lg">
                  {progressPercentage}% completed ({completedInCurrentProgram} / {totalExercisesInCurrentProgram})
                </div>
              </div>

              <div className="mt-6 space-y-2">
                {days.map((d, i) => {
                  const exs = d.exercises || [];
                  const completed = exs.filter((ex) => completedExercises.includes(ex.id)).length;
                  const total = exs.length;
                  return (
                    <div key={i} className="flex justify-between text-sm">
                      <div>Day {d.day} • {d.title}</div>
                      <div className={completed === total ? 'text-green-600 font-medium' : 'text-gray-500'}>
                        {completed === total ? 'Completed' : `${completed}/${total}`}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Weekly progress display */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Last 7 days</h4>
                <div className="flex gap-2">
                  {weeklyProgress.map((w) => (
                    <div key={w.day} className="flex flex-col items-center text-xs">
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100">
                        {w.count}
                      </div>
                      <div className="mt-1 text-gray-400">{new Date(w.day).toLocaleDateString(undefined, { weekday: 'short' })}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reminder controls */}
              <div className="mt-6">
                <label className="text-sm text-gray-600">Daily reminder:</label>
                <div className="flex items-center gap-2 mt-2">
                  <input type="time" value={reminderHour} onChange={(e) => setReminder(e.target.value)} className="px-2 py-1 border rounded" />
                  <button onClick={() => toggleReminder()} className={`px-3 py-1 rounded ${reminderEnabled ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>{reminderEnabled ? 'On' : 'Off'}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievements Modal */}
      <AnimatePresence>
        {showAchievements && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowAchievements(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold">Achievements</h3>
                <button onClick={() => setShowAchievements(false)} className="text-gray-500 p-2">
                  <X size={20} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                {Object.entries(achievementDefs).map(([key, def]) => {
                  const unlocked = achievements.includes(key);
                  return (
                    <div key={key} className={`p-3 rounded-lg border ${unlocked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{def.title}</div>
                          <div className="text-xs text-gray-500">{def.desc}</div>
                        </div>
                        <div className="text-sm">
                          {unlocked ? <span className="text-green-600 font-medium">Unlocked</span> : <span className="text-gray-400">Locked</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 text-sm text-gray-500">Streak: <strong>{streak}</strong> days</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCompletePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-7 relative overflow-hidden"
            >
              {/* Top Accent Bar */}
              <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: "#e3002a" }} />

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                Day {currentDay.day} Completed! 🎉
              </h2>

              <p className="text-gray-600 mt-1 mb-6">
                Amazing session! Help us track your progress better (both optional).
              </p>

              {/* Heart Rate Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Average Heart Rate (BPM)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 135 (optional)"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl text-center text-lg shadow-sm focus:border-[#e3002a] focus:ring-2 focus:ring-[#e3002a]/40 outline-none transition"
                  min="30"
                  max="250"
                />
              </div>

              {/* Weight Input - NEW */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 69.5 (optional)"
                  value={weightInput || ""}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl text-center text-lg shadow-sm focus:border-[#e3002a] focus:ring-2 focus:ring-[#e3002a]/40 outline-none transition"
                  min="30"
                  max="200"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setHeartRate("");
                    setWeightInput("");
                    setShowCompletePopup(false);
                  }}
                  className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
                >
                  Skip
                </button>

                <button
                  onClick={async () => {
                    const hr = heartRate.trim() === "" ? null : Number(heartRate);
                    const wt = weightInput.trim() === "" ? null : Number(weightInput);
                    const programThumbnail = programs.find(p => p.id === selectedProgramId)?.thumbnail || null;
                    // Validation (sirf filled fields ki)
                    if (hr !== null && (hr < 30 || hr > 250)) {
                      alert("Heart rate should be between 30-250 BPM");
                      return;
                    }
                    if (wt !== null && (wt < 30 || wt > 200)) {
                      alert("Weight should be between 30-200 kg");
                      return;
                    }

                    try {
                      // Save heart rate if provided
                      if (hr !== null) {
                        await axios.post(

                          `${API_BASE}/stats/heart-rate`,
                          {
                            heartRate: hr,
                            programTitle: currentProgram.title || "Workout",
                            dayTitle: currentDay.title || `Day ${currentDay.day}`,
                            thumbnail: programThumbnail,
                          },
                          { withCredentials: true }
                        );
                      }

                      // Save weight if provided
                      if (wt !== null) {
                        await axios.post(
                          `${API_BASE}/stats/weight`,
                          { weight: wt },
                          { withCredentials: true }
                        );
                      }
                      const totalSeconds = currentDay.exercises.reduce((sum, ex) => {
                        if (ex.type === 'time') return sum + (ex.time || 0);
                        return sum + ((ex.reps || 12) * (ex.sets || 3) * 3);
                      }, 0);
                      const workoutMinutes = Math.round(totalSeconds / 60);

                      await axios.post(
                        `${API_BASE}/programs/${currentProgram.id}/complete-day`,
                        {
                          day: currentDay.day,
                          workoutMinutes,
                          heartRate: hr,
                          weight: wt,
                        },
                        { withCredentials: true }
                      );

                      console.log("Day completion updated with HR & Weight");

                    } catch (error) {
                      console.error("Failed to save data:", error);
                      alert("Saved locally. Will sync when online.");
                    } finally {
                      setHeartRate("");
                      setWeightInput("");
                      setShowCompletePopup(false);
                    }
                  }}
                  className="flex-1 py-3 rounded-xl text-white font-semibold shadow-md transition hover:opacity-90"
                  style={{ backgroundColor: "#e3002a" }}
                >
                  Save & Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
