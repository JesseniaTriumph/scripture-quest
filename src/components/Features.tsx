import iconLearn from "@/assets/icon-learn.jpg";
import iconCommunity from "@/assets/icon-community.jpg";
import iconAchievement from "@/assets/icon-achievement.jpg";

export const Features = () => {
  const features = [
    {
      icon: iconLearn,
      title: "Interactive Learning",
      description: "8 engaging game modes that make memorization fun and effective. Learn through play, not pressure.",
    },
    {
      icon: iconCommunity,
      title: "Community Powered",
      description: "Join friends, compete with your church group, and celebrate progress together. You're never alone!",
    },
    {
      icon: iconAchievement,
      title: "Track Your Growth",
      description: "Earn XP, unlock achievements, and maintain daily streaks. Watch your spiritual journey flourish!",
    },
  ];

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose Scripture Quest?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We've designed everything to make your scripture memory journey enjoyable, effective, and sustainable.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-4 group">
              <div className="w-24 h-24 mx-auto rounded-3xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                <img 
                  src={feature.icon} 
                  alt={`${feature.title} icon`}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
