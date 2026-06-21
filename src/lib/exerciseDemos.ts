export interface ExerciseDemo {
  name: string
  emoji: string
  muscleGroups: string[]
  equipment: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  description: string
  tips: string[]
}

export const EXERCISE_DEMOS: Record<string, ExerciseDemo> = {
  // ── Chest ────────────────────────────────────────────────────────────────
  'Bench Press': {
    name: 'Bench Press', emoji: '🏋️', muscleGroups: ['Chest', 'Triceps', 'Front Delts'],
    equipment: 'Barbell', difficulty: 'intermediate',
    description: 'Lie flat on a bench, grip the bar just outside shoulder width. Lower the bar to your mid-chest under control, then press back up to full extension. Keep your feet flat, back slightly arched, and shoulder blades retracted throughout.',
    tips: ['Don\'t bounce the bar off your chest — pause briefly at the bottom', 'Keep your wrists stacked directly over your elbows', 'Drive your feet into the floor to create full-body tension'],
  },
  'Incline Bench Press': {
    name: 'Incline Bench Press', emoji: '🏋️', muscleGroups: ['Upper Chest', 'Triceps', 'Front Delts'],
    equipment: 'Barbell', difficulty: 'intermediate',
    description: 'Set the bench to 30–45°. Grip slightly narrower than flat bench, lower the bar to your upper chest. Incline pressing shifts emphasis to the upper chest and front deltoids.',
    tips: ['15–30° incline hits upper chest without excessive shoulder stress', 'Avoid flaring elbows wide — keep them at ~45° from your torso', 'Control the descent to maximise time under tension'],
  },
  'Decline Bench Press': {
    name: 'Decline Bench Press', emoji: '🏋️', muscleGroups: ['Lower Chest', 'Triceps'],
    equipment: 'Barbell', difficulty: 'intermediate',
    description: 'Set the bench to −15° to −30°. Lower the bar to your lower chest. Decline pressing strongly activates the lower pec fibres and reduces shoulder strain compared to flat.',
    tips: ['Secure your feet under the pads before unracking', 'Keep the bar path slightly back toward your face at the top', 'This variation is easier on the shoulders if you have impingement'],
  },
  'Chest Fly': {
    name: 'Chest Fly', emoji: '🏋️', muscleGroups: ['Chest', 'Front Delts'],
    equipment: 'Dumbbells', difficulty: 'beginner',
    description: 'Lie on a bench holding dumbbells above your chest, palms facing each other. Lower them out in a wide arc until you feel a deep stretch in your chest, then squeeze back together. Keep a soft bend in the elbows throughout.',
    tips: ['Never lock out the elbows — maintain a fixed slight bend', 'Think of hugging a large tree; don\'t pull with your arms', 'Stop lowering when elbows reach bench level to avoid shoulder strain'],
  },
  'Cable Crossover': {
    name: 'Cable Crossover', emoji: '🏋️', muscleGroups: ['Chest', 'Front Delts'],
    equipment: 'Cable Machine', difficulty: 'beginner',
    description: 'Stand between two high cables, grip the handles and step forward. Bring your hands together in front of you in a sweeping arc, squeezing your chest at the peak. Return slowly under control.',
    tips: ['Maintain constant tension — cables are better than dumbbells for peak contraction', 'Angle the cables to target upper (low-to-high) or lower (high-to-low) chest', 'Lean slightly forward from the hips to keep tension on the chest, not shoulders'],
  },
  'Push-Up': {
    name: 'Push-Up', emoji: '💪', muscleGroups: ['Chest', 'Triceps', 'Core'],
    equipment: 'Bodyweight', difficulty: 'beginner',
    description: 'Start in a high plank with hands slightly wider than shoulders. Lower your chest to the floor, keeping your body in a straight line, then push back up. This is a foundational upper body pressing movement.',
    tips: ['Don\'t let your hips sag or pike — engage your core throughout', 'Tuck your elbows at 45° rather than flaring them wide', 'To progress, elevate your feet; to regress, drop to your knees'],
  },
  'Dumbbell Pullover': {
    name: 'Dumbbell Pullover', emoji: '🏋️', muscleGroups: ['Chest', 'Lats', 'Triceps'],
    equipment: 'Dumbbell', difficulty: 'intermediate',
    description: 'Lie across a bench, holding one dumbbell with both hands above your chest. Lower the dumbbell in an arc over and behind your head, feeling a stretch in your lats and chest, then pull it back up.',
    tips: ['Keep a slight bend in your elbows — don\'t straighten them at the bottom', 'Focus on the stretch; don\'t lower so far that you lose shoulder stability', 'This exercise uniquely works both chest and lats in one movement'],
  },

  // ── Lats ─────────────────────────────────────────────────────────────────
  'Pull-Up': {
    name: 'Pull-Up', emoji: '💪', muscleGroups: ['Lats', 'Biceps', 'Rear Delts'],
    equipment: 'Pull-Up Bar', difficulty: 'intermediate',
    description: 'Hang from a bar with an overhand grip, hands slightly wider than shoulders. Pull your chest toward the bar by driving your elbows down and back. Lower under control to a full dead hang between reps.',
    tips: ['Initiate the movement by depressing your shoulder blades before bending the elbows', 'Avoid kipping or swinging — full range of motion builds real strength', 'Use a band or assisted machine if you can\'t complete full reps yet'],
  },
  'Lat Pulldown': {
    name: 'Lat Pulldown', emoji: '🏋️', muscleGroups: ['Lats', 'Biceps', 'Rear Delts'],
    equipment: 'Cable Machine', difficulty: 'beginner',
    description: 'Sit at a pulldown machine, grip the bar wider than shoulder width. Pull the bar down to your upper chest by driving your elbows down, squeezing your lats at the bottom. Return slowly to full arm extension.',
    tips: ['Lean back only slightly (10–15°) — this isn\'t a row', 'Focus on pulling with your elbows, not your hands', 'Full arm extension at the top is key for lat development'],
  },
  'Seated Cable Row': {
    name: 'Seated Cable Row', emoji: '🏋️', muscleGroups: ['Lats', 'Mid Back', 'Biceps'],
    equipment: 'Cable Machine', difficulty: 'beginner',
    description: 'Sit at a low cable row with feet on the platform, knees slightly bent. Pull the handle into your lower abdomen, squeezing your shoulder blades together. Return to full arm extension without rounding your back.',
    tips: ['Keep your torso upright — minimal forward lean', 'Pause and squeeze for 1–2 seconds at full contraction', 'Don\'t shrug your shoulders — keep them down and back'],
  },
  'Single-Arm Dumbbell Row': {
    name: 'Single-Arm Dumbbell Row', emoji: '🏋️', muscleGroups: ['Lats', 'Mid Back', 'Biceps'],
    equipment: 'Dumbbell', difficulty: 'beginner',
    description: 'Place one hand and knee on a bench. Row the dumbbell up to your hip, driving the elbow past your torso. This unilateral movement allows a greater range of motion than barbell rows.',
    tips: ['Allow the shoulder to drop at the bottom for a full stretch', 'Pull the elbow toward the hip, not up toward the shoulder', 'Avoid rotating your torso — keep your back parallel to the floor'],
  },
  'T-Bar Row': {
    name: 'T-Bar Row', emoji: '🏋️', muscleGroups: ['Mid Back', 'Lats', 'Biceps'],
    equipment: 'Barbell', difficulty: 'intermediate',
    description: 'Straddle a landmine barbell, hinge at the hips with a neutral spine, and row the bar to your chest. T-bar rows allow heavy loading and a natural grip position that reduces shoulder stress.',
    tips: ['Keep your back flat and hips lower than your shoulders', 'Drive the elbows back, not up', 'Using a close grip targets the mid-back; wide grip hits lats more'],
  },
  'Straight-Arm Pulldown': {
    name: 'Straight-Arm Pulldown', emoji: '🏋️', muscleGroups: ['Lats', 'Core'],
    equipment: 'Cable Machine', difficulty: 'beginner',
    description: 'Stand facing a high cable with straight arms. Pull the bar down in an arc to your thighs, keeping arms straight and squeezing your lats hard at the bottom. This isolates the lats without bicep involvement.',
    tips: ['Hinge slightly at the hips for a better lat stretch at the top', 'Keep your core tight to prevent your back from arching', 'Squeeze at the bottom for 1–2 seconds'],
  },

  // ── Back ─────────────────────────────────────────────────────────────────
  'Barbell Row': {
    name: 'Barbell Row', emoji: '🏋️', muscleGroups: ['Mid Back', 'Lats', 'Biceps'],
    equipment: 'Barbell', difficulty: 'intermediate',
    description: 'Hinge at the hips to ~45°, grip the barbell slightly wider than shoulder width. Row the bar to your lower ribcage, squeezing your shoulder blades together. Lower under control to full arm extension.',
    tips: ['Keep your back flat — a rounded lower back under load risks injury', 'Pull to your hips/belly, not your chest (this isn\'t an upright row)', 'Brace your core as hard as a deadlift'],
  },
  'Cable Row': {
    name: 'Cable Row', emoji: '🏋️', muscleGroups: ['Mid Back', 'Lats', 'Biceps'],
    equipment: 'Cable Machine', difficulty: 'beginner',
    description: 'A variation of seated cable row using a straight bar or different attachment. Adjust grip width to shift emphasis between lats and mid-back.',
    tips: ['Wide grip = more lat activation; close/neutral grip = more mid-back', 'Maintain upright posture — don\'t lean back excessively', 'Control the eccentric (return phase) for maximum muscle stimulus'],
  },
  'Face Pull': {
    name: 'Face Pull', emoji: '🏋️', muscleGroups: ['Rear Delts', 'Rotator Cuff', 'Upper Traps'],
    equipment: 'Cable Machine', difficulty: 'beginner',
    description: 'Set a cable to upper chest height with a rope attachment. Pull the rope toward your face, separating the handles as you pull, ending with elbows high and wide. This is essential for shoulder health and balanced development.',
    tips: ['External rotate at the end — hands higher than elbows at full contraction', 'Keep a slight forward lean for the best angle', 'Light weight with high reps is better than going heavy here'],
  },
  'Rack Pull': {
    name: 'Rack Pull', emoji: '🏋️', muscleGroups: ['Upper Back', 'Traps', 'Glutes'],
    equipment: 'Barbell', difficulty: 'advanced',
    description: 'Set the bar in a rack at knee height. Grip the bar and stand up, focusing on upper back and trap engagement. Rack pulls allow heavier loading than full deadlifts and target the upper posterior chain.',
    tips: ['Set pins so the bar starts at mid-shin to knee level', 'Maintain a neutral spine — this is not a rounded-back exercise', 'Shrug the traps at the top of the movement for full contraction'],
  },
  'Chest-Supported Row': {
    name: 'Chest-Supported Row', emoji: '🏋️', muscleGroups: ['Mid Back', 'Rear Delts', 'Biceps'],
    equipment: 'Dumbbells', difficulty: 'beginner',
    description: 'Lie chest-down on an incline bench, letting the dumbbells hang straight down. Row both dumbbells up, squeezing your shoulder blades together. The chest support eliminates lower back fatigue.',
    tips: ['Great option if you have lower back pain — the bench takes the strain', 'Focus purely on squeezing the shoulder blades together at the top', 'Use a neutral grip (palms facing each other) for most comfortable position'],
  },
  'Inverted Row': {
    name: 'Inverted Row', emoji: '💪', muscleGroups: ['Mid Back', 'Lats', 'Biceps'],
    equipment: 'Barbell / TRX', difficulty: 'beginner',
    description: 'Hang under a fixed barbell or TRX with straight arms, body at an angle. Pull your chest up to the bar/handles, keeping your body rigid. The easier alternative to pull-ups for building pulling strength.',
    tips: ['The more horizontal your body, the harder it is', 'Engage your core — don\'t let your hips drop', 'Progress to pull-ups once this is too easy'],
  },

  // ── Shoulders ──────────────────────────────────────────────────────────
  'Overhead Press': {
    name: 'Overhead Press', emoji: '🏋️', muscleGroups: ['Shoulders', 'Triceps', 'Upper Traps'],
    equipment: 'Barbell', difficulty: 'intermediate',
    description: 'Stand or sit with a barbell at shoulder height, grip just outside shoulder width. Press the bar overhead to full arm extension, then lower it back to your shoulders. The foundational upper body push movement.',
    tips: ['Brace your core hard — don\'t hyperextend your lower back', 'The bar should travel in a straight vertical line past your face', 'Re-rack behind your head is technically possible but not recommended for safety'],
  },
  'Dumbbell Shoulder Press': {
    name: 'Dumbbell Shoulder Press', emoji: '🏋️', muscleGroups: ['Shoulders', 'Triceps'],
    equipment: 'Dumbbells', difficulty: 'beginner',
    description: 'Sit or stand holding dumbbells at shoulder height, palms forward. Press them overhead, bringing them slightly together at the top. Dumbbells allow a more natural range of motion than barbell.',
    tips: ['Don\'t let the dumbbells drift too far forward or behind your ears', 'Keep your core tight and avoid arching your lower back', 'Neutral grip (palms facing in) can be easier on shoulder joints'],
  },
  'Lateral Raise': {
    name: 'Lateral Raise', emoji: '🏋️', muscleGroups: ['Side Delts'],
    equipment: 'Dumbbells', difficulty: 'beginner',
    description: 'Stand holding light dumbbells at your sides. Raise them out to shoulder height with a slight forward tilt, leading with your pinkies. This isolates the lateral deltoid for shoulder width.',
    tips: ['Use lighter weight than you think — going heavy involves traps, not delts', 'Lean slightly forward (15°) to keep tension on the lateral head', 'Pour the water out of a jug: tilt your pinkies slightly up at the top'],
  },
  'Front Raise': {
    name: 'Front Raise', emoji: '🏋️', muscleGroups: ['Front Delts', 'Upper Chest'],
    equipment: 'Dumbbells', difficulty: 'beginner',
    description: 'Stand holding dumbbells in front of your thighs. Raise them forward to shoulder height, keeping arms straight. This targets the anterior deltoid.',
    tips: ['Most pressing exercises already work the front delt heavily — don\'t overdo this', 'Alternate arms or use a plate for variation', 'Stop at shoulder height — raising higher recruits traps more than delts'],
  },
  'Rear Delt Fly': {
    name: 'Rear Delt Fly', emoji: '🏋️', muscleGroups: ['Rear Delts', 'Rotator Cuff'],
    equipment: 'Dumbbells', difficulty: 'beginner',
    description: 'Hinge forward at the hips to ~45°, let the dumbbells hang. Raise them out to shoulder height, leading with your elbows, squeezing your rear delts. Essential for balanced shoulder development.',
    tips: ['Keep a slight bend in the elbows throughout', 'Think of driving your elbows up and out rather than lifting the weights', 'Use lighter weight — rear delts are small and easy to overload with traps'],
  },
  'Arnold Press': {
    name: 'Arnold Press', emoji: '🏋️', muscleGroups: ['Shoulders', 'Triceps', 'Front Delts'],
    equipment: 'Dumbbells', difficulty: 'intermediate',
    description: 'Start with dumbbells at face height, palms facing you. Rotate your palms outward as you press overhead, then reverse the rotation on the way down. The rotation recruits all three deltoid heads.',
    tips: ['The movement should be smooth — don\'t rush the rotation', 'Keep your core braced against the rotational force', 'Popularised by Arnold Schwarzenegger; great for complete shoulder development'],
  },

  // ── Triceps ───────────────────────────────────────────────────────────
  'Skull Crusher': {
    name: 'Skull Crusher', emoji: '🏋️', muscleGroups: ['Triceps'],
    equipment: 'Barbell / Dumbbells', difficulty: 'intermediate',
    description: 'Lie on a bench holding a barbell or dumbbells above your chest with arms extended. Bend only at the elbows, lowering the weight toward your forehead. Press back to extension. This isolates the triceps.',
    tips: ['Keep your upper arms vertical and stationary — only the forearms move', 'The EZ-curl bar is kinder to the wrists than a straight barbell', 'Lower to the top of your head or slightly behind for more range'],
  },
  'Tricep Pushdown': {
    name: 'Tricep Pushdown', emoji: '🏋️', muscleGroups: ['Triceps'],
    equipment: 'Cable Machine', difficulty: 'beginner',
    description: 'Stand at a high cable, grip the bar or rope with hands close together. Keep your upper arms pinned at your sides and push the attachment down to full extension, squeezing the triceps at the bottom.',
    tips: ['Don\'t let your elbows drift forward — keep them at your sides', 'Rope attachment allows external rotation at the bottom for a stronger squeeze', 'Go through full range: from 90° to full lockout'],
  },
  'Overhead Tricep Extension': {
    name: 'Overhead Tricep Extension', emoji: '🏋️', muscleGroups: ['Triceps (Long Head)'],
    equipment: 'Dumbbell / Cable', difficulty: 'beginner',
    description: 'Hold a dumbbell or cable rope overhead with arms extended. Lower behind your head by bending only at the elbows, then press back up. The overhead position stretches the long head of the triceps for maximal growth.',
    tips: ['Keep your upper arms close to your ears throughout', 'The long head of the triceps is best activated in the overhead stretched position', 'Use a single dumbbell held with both hands for best stability'],
  },
  'Close-Grip Bench Press': {
    name: 'Close-Grip Bench Press', emoji: '🏋️', muscleGroups: ['Triceps', 'Chest', 'Front Delts'],
    equipment: 'Barbell', difficulty: 'intermediate',
    description: 'Lie on a bench, grip the bar with hands shoulder-width apart (narrower than regular bench press). Lower the bar to your lower chest and press back up. Shifts emphasis from chest to triceps.',
    tips: ['Don\'t grip too narrow (hands touching) — this strains the wrists', 'Keep elbows tucked at ~45° to your torso', 'Strong triceps will directly improve your bench press max'],
  },
  'Dip': {
    name: 'Dip', emoji: '💪', muscleGroups: ['Triceps', 'Chest', 'Front Delts'],
    equipment: 'Parallel Bars / Dip Station', difficulty: 'intermediate',
    description: 'Support yourself on parallel bars. Lower your body by bending the elbows until your upper arms are at least parallel to the floor, then press back up. Leaning forward shifts emphasis to chest; staying upright hits triceps.',
    tips: ['Stay upright and keep elbows tucked for maximum tricep activation', 'Lean forward slightly for more chest involvement', 'Add weight with a belt once bodyweight becomes easy'],
  },

  // ── Biceps ────────────────────────────────────────────────────────────
  'Barbell Curl': {
    name: 'Barbell Curl', emoji: '💪', muscleGroups: ['Biceps', 'Forearms'],
    equipment: 'Barbell', difficulty: 'beginner',
    description: 'Stand holding a barbell at hip height with an underhand grip. Curl the bar up to your shoulders, keeping your elbows pinned at your sides. Lower under control to full extension.',
    tips: ['Don\'t swing your torso — control the weight without momentum', 'Supinate (rotate) your wrists at the top for a stronger peak contraction', 'The EZ-bar is more comfortable on the wrists for most people'],
  },
  'Dumbbell Curl': {
    name: 'Dumbbell Curl', emoji: '💪', muscleGroups: ['Biceps'],
    equipment: 'Dumbbells', difficulty: 'beginner',
    description: 'Stand or sit holding dumbbells at your sides. Curl them up alternately or together, rotating your palm upward as you lift. Dumbbells allow a longer range of supination than a barbell.',
    tips: ['Keep your elbows stationary — don\'t let them drift forward', 'Fully supinate at the top for maximum bicep squeeze', 'Alternate arms to maintain focus on each side individually'],
  },
  'Hammer Curl': {
    name: 'Hammer Curl', emoji: '💪', muscleGroups: ['Biceps', 'Brachialis', 'Forearms'],
    equipment: 'Dumbbells', difficulty: 'beginner',
    description: 'Stand holding dumbbells with a neutral grip (palms facing each other). Curl the dumbbells up without rotating your wrists. This targets the brachialis and forearms in addition to the biceps.',
    tips: ['Keep your elbows fixed at your sides', 'A thicker brachialis pushes the biceps up, creating a higher peak', 'Rope cable hammer curls provide constant tension throughout the movement'],
  },
  'Preacher Curl': {
    name: 'Preacher Curl', emoji: '💪', muscleGroups: ['Biceps (Lower)', 'Brachialis'],
    equipment: 'Barbell / Dumbbell', difficulty: 'beginner',
    description: 'Sit at a preacher bench with your upper arms resting on the pad. Curl the bar or dumbbell up, keeping your arms pressed firmly against the pad. The preacher bench eliminates cheating and emphasises the lower biceps.',
    tips: ['Don\'t fully lock out at the bottom — keep tension on the biceps', 'The preacher curl places the bicep in a shortened position at the top (weaker)', 'Single-arm variation allows you to focus on each arm separately'],
  },
  'Concentration Curl': {
    name: 'Concentration Curl', emoji: '💪', muscleGroups: ['Biceps'],
    equipment: 'Dumbbell', difficulty: 'beginner',
    description: 'Sit on a bench, brace your elbow against your inner thigh. Curl the dumbbell up with full supination, squeezing at the top. The braced position maximises isolation and prevents swinging.',
    tips: ['This is a pure isolation exercise — go for the squeeze, not the weight', 'Fully supinate (rotate your palm up) to get maximum bicep contraction', 'The peak contraction at the top is the most important part'],
  },
  'Cable Curl': {
    name: 'Cable Curl', emoji: '🏋️', muscleGroups: ['Biceps'],
    equipment: 'Cable Machine', difficulty: 'beginner',
    description: 'Stand at a low cable with a straight bar or EZ-bar attachment. Curl the bar up, keeping tension on the biceps throughout the movement. Cables maintain constant tension, unlike dumbbells where the tension changes through the arc.',
    tips: ['Cables provide consistent tension throughout the range of motion', 'Experiment with different attachments (rope, EZ-bar, single handle)', 'Great as a finisher after heavy barbell curls'],
  },

  // ── Quads ────────────────────────────────────────────────────────────
  'Squat': {
    name: 'Squat', emoji: '🏋️', muscleGroups: ['Quads', 'Glutes', 'Hamstrings', 'Core'],
    equipment: 'Barbell', difficulty: 'intermediate',
    description: 'With a barbell on your upper back, stand with feet shoulder-width apart and toes slightly out. Descend until your thighs are at least parallel to the floor, keeping your chest up and knees tracking over your toes. Drive through your heels to stand.',
    tips: ['Keep the bar in contact with your traps throughout — don\'t let it roll forward', 'Break at the hips and knees simultaneously to initiate the squat', 'Depth: thighs parallel is minimum; ass-to-grass is ideal if mobility allows'],
  },
  'Leg Press': {
    name: 'Leg Press', emoji: '🏋️', muscleGroups: ['Quads', 'Glutes', 'Hamstrings'],
    equipment: 'Leg Press Machine', difficulty: 'beginner',
    description: 'Sit in the leg press machine with feet shoulder-width on the platform. Lower the weight until your knees form 90°, then press back to just short of lockout. A safe alternative to squats that allows very heavy loading.',
    tips: ['Don\'t lock out your knees at the top — maintain constant tension', 'Foot position changes emphasis: high feet = glutes/hams; low feet = quads', 'Avoid letting your lower back round off the pad at the bottom'],
  },
  'Hack Squat': {
    name: 'Hack Squat', emoji: '🏋️', muscleGroups: ['Quads', 'Glutes'],
    equipment: 'Hack Squat Machine', difficulty: 'intermediate',
    description: 'Stand in the hack squat machine with feet low on the platform. Lower down until thighs are parallel, keeping your back against the pad. The fixed movement pattern allows you to focus purely on the legs.',
    tips: ['Low foot placement maximises quad recruitment', 'Full depth is easier to achieve safely here than with free barbell squats', 'Pause at the bottom to eliminate elastic energy rebound'],
  },
  'Leg Extension': {
    name: 'Leg Extension', emoji: '🏋️', muscleGroups: ['Quads'],
    equipment: 'Leg Extension Machine', difficulty: 'beginner',
    description: 'Sit in the leg extension machine with the pad on top of your ankles. Extend your legs to full lockout, squeezing your quads at the top. Lower slowly. This isolates the quadriceps without involving other muscles.',
    tips: ['Squeeze hard at the top and hold for 1–2 seconds', 'Lower slowly — the eccentric is where most muscle growth happens', 'Don\'t use momentum; keep reps controlled'],
  },
  'Bulgarian Split Squat': {
    name: 'Bulgarian Split Squat', emoji: '🏋️', muscleGroups: ['Quads', 'Glutes', 'Hamstrings'],
    equipment: 'Dumbbells / Barbell', difficulty: 'advanced',
    description: 'Elevate your rear foot on a bench, standing on your front leg. Lower your back knee toward the floor, keeping your front knee over your toes. Drive through your front heel to stand. One of the most effective unilateral leg exercises.',
    tips: ['Front foot should be far enough forward that your shin stays vertical', 'Expect significant quad burn — this is more quad-dominant than a lunge', 'Dumbbells are more shoulder-friendly than a barbell for this exercise'],
  },
  'Front Squat': {
    name: 'Front Squat', emoji: '🏋️', muscleGroups: ['Quads', 'Core', 'Upper Back'],
    equipment: 'Barbell', difficulty: 'advanced',
    description: 'Hold the bar in a front rack position across your front deltoids. Keep an upright torso throughout the descent — the front load forces your quads to do more work than a back squat.',
    tips: ['Wrist flexibility is a prerequisite — use a cross-arm grip if you\'re inflexible', 'More upright torso = more quad, less lower back stress', 'Core must be extremely tight to prevent the bar from pulling you forward'],
  },

  // ── Hamstrings ───────────────────────────────────────────────────────
  'Romanian Deadlift': {
    name: 'Romanian Deadlift', emoji: '🏋️', muscleGroups: ['Hamstrings', 'Glutes', 'Lower Back'],
    equipment: 'Barbell', difficulty: 'intermediate',
    description: 'Stand holding a barbell at hip height. Hinge at the hips, pushing them back as you lower the bar along your legs, feeling a deep hamstring stretch. Keep your back flat throughout, then drive your hips forward to stand.',
    tips: ['Push your hips BACK, not down — this is a hip hinge, not a squat', 'Feel the stretch in your hamstrings before reversing the movement', 'Keep the bar close to your legs throughout the entire range of motion'],
  },
  'Leg Curl': {
    name: 'Leg Curl', emoji: '🏋️', muscleGroups: ['Hamstrings'],
    equipment: 'Leg Curl Machine', difficulty: 'beginner',
    description: 'Lie face-down on the leg curl machine with the pad behind your ankles. Curl your legs up toward your glutes, squeezing the hamstrings at the top. Lower slowly under control.',
    tips: ['Full contraction means getting your heels to your glutes', 'Lower slowly — hamstring injuries often occur during the eccentric', 'Seated leg curl (where available) provides a better stretch at the bottom'],
  },
  'Nordic Curl': {
    name: 'Nordic Curl', emoji: '💪', muscleGroups: ['Hamstrings'],
    equipment: 'Bodyweight', difficulty: 'advanced',
    description: 'Kneel on a mat with your feet anchored. Lower your torso toward the floor as slowly as possible, using your hamstrings as a brake. Catch yourself with your hands, then use your hands to push back up to start.',
    tips: ['One of the most effective hamstring exercises for injury prevention', 'Start by lowering only halfway if you can\'t control the full range', 'Athletes with strong Nordics have significantly lower hamstring injury rates'],
  },
  'Stiff-Leg Deadlift': {
    name: 'Stiff-Leg Deadlift', emoji: '🏋️', muscleGroups: ['Hamstrings', 'Lower Back'],
    equipment: 'Barbell', difficulty: 'intermediate',
    description: 'Similar to Romanian deadlift but with less knee bend. Keep your legs nearly straight as you hinge forward, feeling maximum hamstring stretch. Best performed on a platform for extra range of motion.',
    tips: ['Keep a neutral spine — don\'t round your lower back under load', 'Stop when you feel a strong hamstring stretch, not when the bar hits the floor', 'More hip flexion than RDL creates a more intense hamstring stretch'],
  },
  'Good Morning': {
    name: 'Good Morning', emoji: '🏋️', muscleGroups: ['Hamstrings', 'Lower Back', 'Glutes'],
    equipment: 'Barbell', difficulty: 'advanced',
    description: 'Place a barbell on your upper back as for a squat. Hinge forward at the hips, keeping legs straight, until your torso is nearly parallel to the floor. Squeeze your glutes and hamstrings to stand back up.',
    tips: ['Keep a very tight arch in your lower back throughout', 'Start with a light weight — the leverage makes this exercise deceptively hard', 'An excellent exercise for building the posterior chain strength needed for deadlifts'],
  },

  // ── Glutes ───────────────────────────────────────────────────────────
  'Hip Thrust': {
    name: 'Hip Thrust', emoji: '🏋️', muscleGroups: ['Glutes', 'Hamstrings'],
    equipment: 'Barbell', difficulty: 'intermediate',
    description: 'Sit against a bench with a barbell across your hips. Drive your hips up until your body forms a straight line from knees to shoulders, squeezing your glutes hard at the top. Lower under control.',
    tips: ['The top position is key: squeeze your glutes as hard as possible for 1–2 seconds', 'Keep your chin tucked — don\'t hyperextend your neck at the top', 'Use a barbell pad for comfort; load heavily — glutes are a large, strong muscle'],
  },
  'Glute Bridge': {
    name: 'Glute Bridge', emoji: '💪', muscleGroups: ['Glutes', 'Hamstrings'],
    equipment: 'Bodyweight / Barbell', difficulty: 'beginner',
    description: 'Lie on your back with knees bent and feet flat. Drive your hips up, squeezing your glutes at the top. The glute bridge is the foundation of the hip thrust and can be loaded with a barbell across the hips.',
    tips: ['Push through your heels, not your toes', 'Pause and squeeze at the top for maximum glute activation', 'Single-leg variation dramatically increases the difficulty and corrects imbalances'],
  },
  'Cable Kickback': {
    name: 'Cable Kickback', emoji: '🏋️', muscleGroups: ['Glutes'],
    equipment: 'Cable Machine', difficulty: 'beginner',
    description: 'Attach an ankle cuff to a low cable and stand facing the machine. Kick your leg back in a controlled arc, squeezing your glute at the top. This isolates the glutes without involving the lower back.',
    tips: ['Keep your torso stable — don\'t swing or rotate', 'Squeeze the glute hard at the peak contraction', 'Keep a slight bend in your standing knee throughout'],
  },
  'Sumo Deadlift': {
    name: 'Sumo Deadlift', emoji: '🏋️', muscleGroups: ['Glutes', 'Inner Thighs', 'Hamstrings'],
    equipment: 'Barbell', difficulty: 'intermediate',
    description: 'Stand with a wide stance, toes pointed out. Grip the bar inside your knees and pull the bar up by driving your knees out and hips through. The wide stance shifts emphasis to the glutes and inner thighs.',
    tips: ['Push your knees out hard against your arms throughout the lift', 'More upright torso than conventional deadlift — use this if you have proportionally long legs', 'Break the floor with your legs, then finish by driving your hips forward'],
  },
  'Step-Up': {
    name: 'Step-Up', emoji: '💪', muscleGroups: ['Glutes', 'Quads'],
    equipment: 'Box / Bench', difficulty: 'beginner',
    description: 'Stand in front of a box or bench. Step up onto it with one foot, driving through your heel to bring your whole body up. Step back down and repeat. A functional movement that builds single-leg strength.',
    tips: ['Drive through the heel of the elevated foot — not the toes', 'Don\'t push off the floor with your back foot', 'Use dumbbells to add resistance once the movement feels controlled'],
  },
  'Curtsy Lunge': {
    name: 'Curtsy Lunge', emoji: '💪', muscleGroups: ['Glutes', 'Quads', 'Hip Abductors'],
    equipment: 'Bodyweight / Dumbbells', difficulty: 'beginner',
    description: 'Stand with feet together. Step one foot diagonally back behind and to the outside of the other foot, lowering your back knee toward the floor. Return to start. This targets the glutes from a different angle than standard lunges.',
    tips: ['Keep your chest upright throughout', 'The diagonal step is what activates the glutes differently from a regular lunge', 'Great exercise for targeting the gluteus medius for hip stability'],
  },

  // ── Core ─────────────────────────────────────────────────────────────
  'Plank': {
    name: 'Plank', emoji: '💪', muscleGroups: ['Core', 'Shoulders'],
    equipment: 'Bodyweight', difficulty: 'beginner',
    description: 'Lie face-down and support yourself on forearms and toes, keeping your body in a straight line from head to heels. Brace your core as hard as possible and hold the position.',
    tips: ['Don\'t let your hips sag or pike up — aim for a perfectly straight line', 'Squeeze your glutes and quads too — a plank is a full-body brace', 'Progress by adding time, not by sagging with bad form'],
  },
  'Cable Crunch': {
    name: 'Cable Crunch', emoji: '🏋️', muscleGroups: ['Abs'],
    equipment: 'Cable Machine', difficulty: 'beginner',
    description: 'Kneel at a high cable with a rope attachment. Hold the rope at your temples and crunch your ribcage toward your knees, contracting your abs hard. Return to a slight extension. Cables allow you to progressively load the abs.',
    tips: ['The movement should come from your abs, not your hip flexors', 'Keep your hips still — only your upper back should round', 'Focus on the squeeze at the bottom; weight is secondary'],
  },
  'Hanging Leg Raise': {
    name: 'Hanging Leg Raise', emoji: '💪', muscleGroups: ['Abs', 'Hip Flexors'],
    equipment: 'Pull-Up Bar', difficulty: 'intermediate',
    description: 'Hang from a pull-up bar with a full dead hang. Raise your legs to horizontal (bent knee) or vertical (straight leg), then lower under control. One of the most effective abs exercises due to the full range of motion.',
    tips: ['Avoid swinging — control the movement in both directions', 'Progress from bent knee to straight leg as you get stronger', 'Posterior pelvic tilt at the top for maximum ab contraction'],
  },
  'Ab Rollout': {
    name: 'Ab Rollout', emoji: '💪', muscleGroups: ['Abs', 'Lats', 'Core'],
    equipment: 'Ab Wheel', difficulty: 'advanced',
    description: 'Kneel with the ab wheel in front of you. Roll the wheel forward as far as you can without your hips dropping, then pull back in using your abs and lats. One of the most effective core strengthening exercises.',
    tips: ['Start with short ranges of motion — rolling too far too soon causes lower back injury', 'Brace your core before you begin rolling', 'The pull-back phase should be led by your abs, not your lower back'],
  },
  'Russian Twist': {
    name: 'Russian Twist', emoji: '💪', muscleGroups: ['Obliques', 'Abs'],
    equipment: 'Bodyweight / Weight Plate', difficulty: 'beginner',
    description: 'Sit on the floor with knees bent and torso leaning back at 45°. Hold a weight plate or clasp hands, and rotate your torso side to side. This targets the obliques for rotational core strength.',
    tips: ['Lift your feet off the ground to increase difficulty', 'Rotate from your torso, not just your arms', 'Keep your lower back from rounding — maintain the 45° lean throughout'],
  },
  'Pallof Press': {
    name: 'Pallof Press', emoji: '🏋️', muscleGroups: ['Obliques', 'Core'],
    equipment: 'Cable Machine', difficulty: 'beginner',
    description: 'Stand sideways to a cable machine, holding the handle at chest height. Press the handle straight out in front of you, resisting the rotation, then bring it back. This anti-rotation exercise builds deep core stability.',
    tips: ['The goal is NOT to rotate — resist the cable\'s pull', 'Keep your hips square throughout', 'Excellent exercise for lower back health and sports performance'],
  },

  // ── Legs / General ───────────────────────────────────────────────────
  'Deadlift': {
    name: 'Deadlift', emoji: '🏋️', muscleGroups: ['Hamstrings', 'Glutes', 'Back', 'Traps'],
    equipment: 'Barbell', difficulty: 'advanced',
    description: 'Stand with feet hip-width, the bar over your mid-foot. Hinge and grip the bar just outside your shins. Drive through the floor as you stand, keeping the bar close to your body throughout. The king of compound movements.',
    tips: ['Set your back before you pull — neutral spine is non-negotiable', 'Bar should drag up your shins and thighs throughout the lift', 'Think: push the floor away, not pull the bar up'],
  },
  'Lunges': {
    name: 'Lunges', emoji: '💪', muscleGroups: ['Quads', 'Glutes', 'Hamstrings'],
    equipment: 'Bodyweight / Dumbbells', difficulty: 'beginner',
    description: 'Step forward with one leg and lower your back knee toward the floor until both knees form 90°. Push through your front foot to return to start. Lunges build unilateral leg strength and balance.',
    tips: ['Keep your front knee tracking over your toes — don\'t let it cave inward', 'Walk lunges, reverse lunges, and lateral lunges each hit the muscles differently', 'Add dumbbells or a barbell to progressively overload'],
  },
  'Calf Raise': {
    name: 'Calf Raise', emoji: '💪', muscleGroups: ['Calves'],
    equipment: 'Bodyweight / Machine', difficulty: 'beginner',
    description: 'Stand with feet on the edge of a step or calf raise machine. Lower your heels below the step level, then rise onto your toes as high as possible. Lower slowly. Calves respond well to high volume and full range.',
    tips: ['Full range: go as low as possible and as high as possible each rep', 'Calves are notoriously stubborn — use high reps (15–25) and pause at the top', 'Bent-knee calf raises (seated) target the soleus; straight-leg targets the gastrocnemius'],
  },
  'Box Jump': {
    name: 'Box Jump', emoji: '🏃', muscleGroups: ['Quads', 'Glutes', 'Calves'],
    equipment: 'Plyo Box', difficulty: 'intermediate',
    description: 'Stand in front of a plyo box with feet shoulder-width. Dip into a quarter squat, swing your arms, and jump onto the box, landing softly with knees slightly bent. Step down carefully between reps.',
    tips: ['Land softly — absorb the impact by bending your knees, not slamming down', 'Step down, don\'t jump down — preserves your knees and reduces injury risk', 'Build height gradually — a missed box jump is a shin-killer'],
  },
  'Wall Sit': {
    name: 'Wall Sit', emoji: '💪', muscleGroups: ['Quads', 'Glutes'],
    equipment: 'Bodyweight', difficulty: 'beginner',
    description: 'Stand with your back flat against a wall. Slide down until your thighs are parallel to the floor and your knees form 90°. Hold the position. This isometric exercise builds quad endurance.',
    tips: ['Thighs must be parallel to the floor — higher is easier and defeats the purpose', 'Add weight by holding a plate on your thighs for extra loading', 'Time the hold — aim to improve your hold time progressively'],
  },

  // ── Running sessions ─────────────────────────────────────────────────
  'Easy Run': {
    name: 'Easy Run', emoji: '🏃', muscleGroups: ['Cardiovascular System', 'Legs'],
    equipment: 'None', difficulty: 'beginner',
    description: 'A comfortable, conversational-pace run that forms the backbone of any running program. You should be able to hold a conversation throughout. Easy runs build your aerobic base, improve recovery, and make up 70-80% of total training volume.',
    tips: ['Run at 60–70% of max heart rate — if you can\'t talk, slow down', 'These feel "too easy" but that\'s the point — save the hard effort for sessions', 'Focus on form: relaxed shoulders, slight forward lean, midfoot strike'],
  },
  'Long Run': {
    name: 'Long Run', emoji: '🏃', muscleGroups: ['Cardiovascular System', 'Legs', 'Mental Endurance'],
    equipment: 'None', difficulty: 'intermediate',
    description: 'The cornerstone of distance running training. Performed at an easy pace (60–70% HR), the long run builds aerobic capacity, fat burning efficiency, and the mental toughness needed for race day. Increase distance by no more than 10% per week.',
    tips: ['Start slow — the goal is to finish strong, not to go fast', 'Hydrate before you\'re thirsty on runs over 60 minutes', 'The 10% rule: never increase weekly long run distance by more than 10%'],
  },
  'Tempo Run': {
    name: 'Tempo Run', emoji: '🏃', muscleGroups: ['Cardiovascular System', 'Legs'],
    equipment: 'None', difficulty: 'intermediate',
    description: 'A comfortably hard effort run at 75–85% of maximum heart rate — faster than easy, slower than a race. Tempo running raises your lactate threshold, allowing you to sustain a faster pace for longer. Aim to be able to speak in short phrases only.',
    tips: ['Heart rate zone 3–4: "comfortably hard" — hard but controlled', 'Start and finish with 10 minutes easy warm-up/cool-down', 'Gradually build the duration of the tempo section over the program weeks'],
  },
  'Interval Training': {
    name: 'Interval Training', emoji: '🏃', muscleGroups: ['Cardiovascular System', 'Legs', 'Speed'],
    equipment: 'None', difficulty: 'advanced',
    description: 'High-intensity repetitions at 90–95% max heart rate, separated by recovery jogs or walks. Intervals improve VO2 max, running economy, and race-pace speed. Classic formats: 400m × 6, 800m × 4, or 1km × 5.',
    tips: ['Warm up thoroughly for at least 15 minutes before starting intervals', 'Recovery between intervals should be long enough to allow quality on the next rep', 'Don\'t do more than one interval session per week — they\'re very taxing'],
  },
  'Recovery Run': {
    name: 'Recovery Run', emoji: '🏃', muscleGroups: ['Cardiovascular System', 'Legs'],
    equipment: 'None', difficulty: 'beginner',
    description: 'A very short, very easy jog (below 60% HR) done the day after a hard session. Recovery runs promote blood flow to flush out soreness without adding training stress. If you feel bad, walk instead — no shame in that.',
    tips: ['Slower than your easy run pace — this is genuinely just moving your legs', 'Keep it short: 20–30 minutes maximum', 'If you feel stiff and sore, this is exactly the right day for a recovery run'],
  },
  'Rest / Cross-Train': {
    name: 'Rest / Cross-Train', emoji: '🧘', muscleGroups: ['Recovery'],
    equipment: 'None', difficulty: 'beginner',
    description: 'Rest is where the adaptation happens. Your body gets stronger during recovery, not during the workout. Cross-training options: swimming, cycling, yoga, walking — anything low-impact that keeps you moving without adding running stress.',
    tips: ['Don\'t feel guilty about rest days — they\'re as important as the runs', 'Light yoga or stretching is beneficial on rest days', 'Sleep is the most powerful recovery tool available'],
  },

  // ── Cycling sessions ─────────────────────────────────────────────────
  'Endurance Ride': {
    name: 'Endurance Ride', emoji: '🚴', muscleGroups: ['Cardiovascular System', 'Legs'],
    equipment: 'Bike', difficulty: 'beginner',
    description: 'A steady-state ride at 60–70% max heart rate that builds your aerobic base. The equivalent of an easy run for cyclists. Forms the bulk of any cycling training program.',
    tips: ['Maintain a cadence of 80–100 RPM for efficient pedalling', 'Zone 2 training (60–70% HR) is where most aerobic adaptation occurs', 'Ensure your bike is properly fitted before long rides'],
  },
  'Sprint Intervals on Bike': {
    name: 'Sprint Intervals on Bike', emoji: '🚴', muscleGroups: ['Cardiovascular System', 'Legs', 'Power'],
    equipment: 'Bike / Spin Bike', difficulty: 'advanced',
    description: 'Short, maximal-effort sprints (10–30 seconds) separated by recovery periods. Builds speed, power, and anaerobic capacity. Best done on a stationary or turbo trainer where you can safely go all-out.',
    tips: ['Warm up for 15+ minutes before starting sprints', 'True maximal effort means you couldn\'t hold that pace for another second', 'Recovery between sprints should be 3–5× the sprint duration'],
  },
  'Hill Repeats on Bike': {
    name: 'Hill Repeats on Bike', emoji: '🚴', muscleGroups: ['Legs', 'Cardiovascular System'],
    equipment: 'Bike', difficulty: 'intermediate',
    description: 'Repeat climbs up a moderate hill at 80–90% effort, recovering on the descent. Hill repeats build strength, climbing ability, and mental toughness.',
    tips: ['Maintain a consistent effort on each rep — don\'t go too hard on the first one', 'Stay seated where possible to build leg strength', 'Recovery on the descent should be easy — don\'t chase speed'],
  },
  'Tempo Ride': {
    name: 'Tempo Ride', emoji: '🚴', muscleGroups: ['Cardiovascular System', 'Legs'],
    equipment: 'Bike', difficulty: 'intermediate',
    description: 'A sustained effort at 75–85% max heart rate — faster than endurance pace but not maximal. Raises your functional threshold power (FTP) and improves your ability to sustain a hard effort.',
    tips: ['Zone 3–4: "comfortably hard"', 'Aim to hold a steady power output or pace throughout', 'Include a proper warm-up and cool-down'],
  },

  // ── Swimming sessions ─────────────────────────────────────────────────
  'Steady-State Swim': {
    name: 'Steady-State Swim', emoji: '🏊', muscleGroups: ['Cardiovascular System', 'Full Body'],
    equipment: 'Pool', difficulty: 'beginner',
    description: 'Continuous swimming at a comfortable pace, focusing on stroke technique and breathing rhythm. The foundation of any swim program. Builds aerobic base and stroke efficiency.',
    tips: ['Focus on technique first — inefficient swimming wastes huge amounts of energy', 'Rotate your body 45° with each stroke; don\'t swim flat', 'Breathe bilaterally (both sides) for balanced shoulder development'],
  },
  'Drill Session': {
    name: 'Drill Session', emoji: '🏊', muscleGroups: ['Technique', 'Full Body'],
    equipment: 'Pool', difficulty: 'beginner',
    description: 'Focused practice of specific swimming technique elements: catch drill, kickboard sets, pull buoy sets, fingertip drag, etc. Technique improvements have a larger impact on performance than fitness alone in swimming.',
    tips: ['Use a kickboard to isolate leg technique and build kick strength', 'Pull buoy eliminates leg kick to focus on arm pull mechanics', 'Video yourself underwater if possible — technique flaws are hard to feel'],
  },
  'Swim Intervals': {
    name: 'Swim Intervals', emoji: '🏊', muscleGroups: ['Cardiovascular System', 'Full Body', 'Speed'],
    equipment: 'Pool', difficulty: 'intermediate',
    description: 'Repeat swims of a set distance (e.g. 4×100m, 8×50m) with a fixed rest interval. Builds speed and anaerobic capacity. Use a pace clock or lap counter to track your times.',
    tips: ['Aim for consistent split times across all reps', 'Rest time determines intensity: shorter rest = harder', 'Track your times — improvement in interval pace means your fitness is improving'],
  },
  'Open Water Swim': {
    name: 'Open Water Swim', emoji: '🏊', muscleGroups: ['Full Body', 'Navigation', 'Mental Strength'],
    equipment: 'Open Water', difficulty: 'advanced',
    description: 'Swimming in natural water (lake, sea, river) without lane ropes. Develops sighting skills, comfort in open water, and psychological resilience. Essential preparation for triathlons or open water events.',
    tips: ['Always swim with a buddy or notify someone of your planned route', 'Practice sighting (lifting your head briefly to check direction) every 8–10 strokes', 'Wear a high-visibility swim buoy for safety'],
  },
}
