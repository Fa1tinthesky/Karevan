import { motion } from "framer-motion";
import { ArrowLeft, Plus, UserPlus, Send, MoreVertical } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import ChatEmbedded from "../components/ChatEmbedded.tsx";

const goalsData: Record<string, {
  name: string; avatar: string; target: number; current: number;
  members: { name: string; initial: string; contributed: number }[];
  messages: { sender: string; text: string; time: string; isMe?: boolean }[];
}> = {
  "1": {
    name: "Trip to Istanbul 🇹🇷",
    avatar: "✈️",
    target: 15000,
    current: 8750,
    members: [
      { name: "Firdavs", initial: "F", contributed: 3000 },
      { name: "Asror", initial: "A", contributed: 2500 },
      { name: "Sardor", initial: "S", contributed: 1750 },
      { name: "Muhammadjon", initial: "M", contributed: 1500 },
    ],
    messages: [
      { sender: "Asror", text: "I added 500 TJS today! 🎉", time: "14:30" },
      { sender: "Firdavs", text: "Nice! We're almost there", time: "14:32", isMe: true },
      { sender: "Sardor", text: "I'll add more next week", time: "14:35" },
      { sender: "Muhammadjon", text: "Let's book tickets when we hit 12k!", time: "14:40" },
    ],
  },
  "2": {
    name: "New iPhone 📱", avatar: "📱", target: 8000, current: 3200,
    members: [
      { name: "Firdavs", initial: "F", contributed: 2000 },
      { name: "Dilshod", initial: "D", contributed: 1200 },
    ],
    messages: [
      { sender: "Dilshod", text: "How much more do we need?", time: "10:00" },
      { sender: "Firdavs", text: "About 4,800 TJS more", time: "10:05", isMe: true },
    ],
  },
  "3": {
    name: "Wedding Fund 💍", avatar: "💍", target: 50000, current: 22000,
    members: [
      { name: "Firdavs", initial: "F", contributed: 8000 },
      { name: "Asror", initial: "A", contributed: 5000 },
      { name: "Sardor", initial: "S", contributed: 4000 },
      { name: "Muhammadjon", initial: "M", contributed: 3000 },
      { name: "Dilshod", initial: "D", contributed: 1500 },
      { name: "Kamoliddin", initial: "K", contributed: 500 },
    ],
    messages: [
      { sender: "Asror", text: "When's the big day? 😄", time: "09:00" },
      { sender: "Firdavs", text: "September inshallah!", time: "09:10", isMe: true },
    ],
  },
  "4": {
    name: "Gaming PC 🎮", avatar: "🎮", target: 6000, current: 5400,
    members: [
      { name: "Firdavs", initial: "F", contributed: 3000 },
      { name: "Sardor", initial: "S", contributed: 2400 },
    ],
    messages: [
      { sender: "Sardor", text: "Only 600 more!! 🔥", time: "16:00" },
      { sender: "Firdavs", text: "Let's finish it this week", time: "16:05", isMe: true },
    ],
  },
};

const GoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const goal = goalsData[id || "1"];

  if (!goal) {
    navigate("/wallet");
    return null;
  }

  const progress = (goal.current / goal.target) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="gradient-primary px-5 pt-12 pb-5 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/wallet")} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-primary-foreground font-semibold text-base">{goal.name}</h1>
          <button className="text-primary-foreground">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Goal Progress */}
        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4 border border-primary-foreground/10">
          <div className="text-center mb-3">
            <span className="text-4xl">{goal.avatar}</span>
            <div className="mt-2">
              <span className="text-primary-foreground text-2xl font-bold">
                {goal.current.toLocaleString()}
              </span>
              <span className="text-primary-foreground/60 text-sm"> / {goal.target.toLocaleString()} TJS</span>
            </div>
          </div>
          <div className="h-2 bg-primary-foreground/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-primary-foreground/80 rounded-full"
            />
          </div>
          <p className="text-primary-foreground/60 text-xs text-center mt-2">
            {Math.round(progress)}% complete • {(goal.target - goal.current).toLocaleString()} TJS remaining
          </p>
        </div>

        {/* Members */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex -space-x-2">
            {goal.members.map((m, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-primary-foreground/20 border-2 border-primary flex items-center justify-center"
              >
                <span className="text-xs font-bold text-primary-foreground">{m.initial}</span>
              </div>
            ))}
          </div>
          <button className="flex items-center gap-1 bg-primary-foreground/15 rounded-lg px-3 py-1.5 text-primary-foreground text-xs font-medium">
            <UserPlus className="w-3 h-3" /> Add Member
          </button>
        </div>
      </div>

      {/* Member Contributions */}
      <div className="px-5 mt-4">
        <h3 className="text-foreground text-sm font-semibold mb-2">Contributions</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {goal.members.map((m, i) => (
            <div key={i} className="bg-card rounded-xl p-3 shadow-card min-w-[120px] flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <span className="text-xs font-bold text-primary">{m.initial}</span>
              </div>
              <p className="text-foreground text-xs font-medium truncate">{m.name}</p>
              <p className="text-primary text-sm font-bold">{m.contributed.toLocaleString()} TJS</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      {/* <div className="flex-1 px-5 mt-4 space-y-3 overflow-y-auto"> */}
      {/*   <h3 className="text-foreground text-sm font-semibold">Group Chat</h3> */}
      {/*   {goal.messages.map((msg, i) => ( */}
      {/*     <motion.div */}
      {/*       key={i} */}
      {/*       initial={{ opacity: 0, y: 10 }} */}
      {/*       animate={{ opacity: 1, y: 0 }} */}
      {/*       transition={{ delay: i * 0.05 }} */}
      {/*       className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`} */}
      {/*     > */}
      {/*       <div */}
      {/*         className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${ */}
      {/*           msg.isMe */}
      {/*             ? "gradient-primary text-primary-foreground rounded-br-md" */}
      {/*             : "bg-card shadow-card text-foreground rounded-bl-md" */}
      {/*         }`} */}
      {/*       > */}
      {/*         {!msg.isMe && ( */}
      {/*           <p className="text-primary text-[10px] font-semibold mb-0.5">{msg.sender}</p> */}
      {/*         )} */}
      {/*         <p className="text-sm">{msg.text}</p> */}
      {/*         <p className={`text-[10px] mt-1 ${msg.isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}> */}
      {/*           {msg.time} */}
      {/*         </p> */}
      {/*       </div> */}
      {/*     </motion.div> */}
      {/*   ))} */}
      {/* </div> */}

      <ChatEmbedded />
    </div>
  );
};

export default GoalDetail;
