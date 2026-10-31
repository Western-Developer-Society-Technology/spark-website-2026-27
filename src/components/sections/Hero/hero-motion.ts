// Figma frame 6:30, mapped onto the corresponding artwork in frame 111:2.
// Times are milliseconds; values and cubic curves retain native keyframe precision.
// Figma stores easing on the arriving frame; Web Animations uses the departing frame.
export type HeroMotion = {
  nodeId: string;
  /** A `data-part` descendant of the node, for pieces with no Figma node of their own. */
  part?: string;
  property: "rotate" | "translate" | "scale" | "opacity" | "filter";
  frames: readonly (readonly [time: number, value: number | string | readonly [number, number], easing: string])[];
  bakedBlur?: number;
};

export const HERO_DURATION = 4000;

export const HERO_MOTION: readonly HeroMotion[] = [
  {nodeId: "111:95",property: "rotate",frames: [[0,-15.000000417413029,"linear"],[174.286,-15.000000417413029,"cubic-bezier(0.14961610734462738,0.1983768790960312,0.3145204782485962,0.7648504972457886)"],[3710.79,0,"linear"],[4000,0,"linear"]]},
  {nodeId: "111:95",property: "translate",frames: [[0,[0,34.5],"cubic-bezier(0.47999998927116394,0,0.1899999976158142,0.9900000095367432)"],[1656.474,[0,0],"linear"],[4000,[0,0],"linear"]]},
  {nodeId: "111:95",property: "scale",frames: [[0,[0.800000011920929,0.7999998927116394],"linear"],[68.556,[0.800000011920929,0.7999998927116394],"cubic-bezier(0.47999998927116394,0,0.1899999976158142,0.9900000095367432)"],[1726.895,[1,1],"linear"],[4000,[1,1],"linear"]]},
  // The wordmark paints above the eclipse, so it waits for the eclipse to form before fading in.
  {nodeId: "111:96",property: "translate",frames: [[0,[0,60],"linear"],[400,[0,60],"cubic-bezier(0.33,0,0.15,1)"],[2500,[0,0],"linear"],[4000,[0,0],"linear"]]},
  {nodeId: "111:96",property: "filter",frames: [[0,12,"linear"],[902.919,12,"cubic-bezier(0.5,0,0.5,1)"],[2500,0,"linear"],[4000,0,"linear"]]},
  {nodeId: "111:96",property: "opacity",frames: [[0,0,"linear"],[700,0,"cubic-bezier(0.5,0,0.5,1)"],[1400,1,"linear"],[4000,1,"linear"]]},
  {nodeId: "111:97",property: "translate",frames: [[0,[0,33],"cubic-bezier(0.47999998927116394,0,0.1899999976158142,0.9900000095367432)"],[1656.474,[0,0],"linear"],[4000,[0,0],"linear"]]},
  {nodeId: "111:98",property: "translate",frames: [[0,[71,153.5],"linear"],[277.223,[71,153.5],"linear"],[1193.706,[-0.19983291625976562,5.659881591796875],"linear"],[1765.021,[-8.299930572509766,-7.510040283203125],"cubic-bezier(0.5,0,0.1899999976158142,0.9900000095367432)"],[3499.405,[5,0],"linear"],[4000,[5,0],"linear"]]},
  {nodeId: "111:98",property: "scale",frames: [[0,[1,1],"linear"],[277.223,[1,1],"cubic-bezier(0.5,0,0.5,1)"],[1193.706,[1.059999942779541,1.0599998235702515],"linear"],[1765.021,[1.059999942779541,1.0599998235702515],"cubic-bezier(0.5,0,0.1899999976158142,0.9900000095367432)"],[3499.405,[1,0.9999998807907104],"linear"],[4000,[1,0.9999998807907104],"linear"]]},
  {nodeId: "111:99",property: "translate",frames: [[0,[0,133.5],"cubic-bezier(0.4834657907485962,0.00037042025360278785,0.19157461822032928,0.9850484728813171)"],[1656.474,[0,0],"linear"],[4000,[0,0],"linear"]]},
  {nodeId: "111:99",property: "filter",frames: [[0,49.70000076293945,"linear"],[529.159,49.70000076293945,"cubic-bezier(0.5,0,0.5,1)"],[2319.445,5,"linear"],[4000,5,"linear"]],bakedBlur: 7},
  {nodeId: "111:108",property: "translate",frames: [[0,[0,133.5],"cubic-bezier(0.4834657907485962,0.00037042025360278785,0.19157461822032928,0.9850484728813171)"],[1656.474,[0,0],"linear"],[4000,[0,0],"linear"]]},
  {nodeId: "111:108",property: "opacity",frames: [[0,0,"linear"],[2319.445,0,"cubic-bezier(0.5,0,0.5,1)"],[2824.409,1,"linear"],[4000,1,"linear"]]},
  {nodeId: "111:107",property: "translate",frames: [[0,[0,286],"cubic-bezier(0.47999998927116394,0,0.1899999976158142,0.9900000095367432)"],[2146.475,[0,0],"linear"],[4000,[0,0],"linear"]]},
  {nodeId: "111:107",property: "opacity",frames: [[0,0,"linear"],[1814.481,0,"cubic-bezier(0.5,0,0.5,1)"],[2319.445,1,"linear"],[4000,1,"linear"]]},
  {nodeId: "111:100",property: "translate",frames: [[0,[0,154.80963134765625],"cubic-bezier(0.47999998927116394,0,0.1899999976158142,0.9900000095367432)"],[1656.474,[0,0],"linear"],[4000,[0,0],"linear"]]},
  {nodeId: "111:100",property: "scale",frames: [[0,[0.6200000047683716,0.6200000047683716],"linear"],[613.208,[0.6200000047683716,0.6200000047683716],"cubic-bezier(0.47999998927116394,0,0.1899999976158142,0.9900000095367432)"],[1377.329,[1.090000033378601,1.0899999141693115],"cubic-bezier(0.47999998927116394,0,0.1899999976158142,0.9900000095367432)"],[1614.078,[1.090000033378601,1.090000033378601],"cubic-bezier(0.5,0,0.18864493072032928,0.9874730706214905)"],[3499.405,[0.8399999737739563,0.8399997353553772],"linear"],[4000,[0.8399999737739563,0.8399997353553772],"linear"]]},
  {nodeId: "111:100",property: "opacity",frames: [[0,0,"linear"],[582.882,0,"cubic-bezier(0.47999998927116394,0,0.1899999976158142,0.9900000095367432)"],[1163.964,1,"cubic-bezier(0.47999998927116394,0,0.1899999976158142,0.9900000095367432)"],[1458.485,1,"cubic-bezier(0.5,0,0.1899999976158142,0.9900000095367432)"],[3499.405,0.76,"linear"],[4000,0.76,"linear"]]},
  // Once the wordmark settles, its "A" blurs away and the star grows out of it.
  {nodeId: "111:96",part: "a",property: "opacity",frames: [[0,1,"linear"],[2500,1,"cubic-bezier(0.5,0,0.5,1)"],[2750,0,"linear"],[4000,0,"linear"]]},
  {nodeId: "111:96",part: "a",property: "filter",frames: [[0,0,"linear"],[2500,0,"cubic-bezier(0.5,0,0.5,1)"],[2750,12,"linear"],[4000,12,"linear"]]},
  {nodeId: "111:96",part: "sp",property: "translate",frames: [[0,[0,0],"linear"],[2500,[0,0],"cubic-bezier(0.47999998927116394,0,0.1899999976158142,0.9900000095367432)"],[3000,[-20,0],"linear"],[4000,[-20,0],"linear"]]},
  {nodeId: "111:96",part: "rk",property: "translate",frames: [[0,[0,0],"linear"],[2500,[0,0],"cubic-bezier(0.47999998927116394,0,0.1899999976158142,0.9900000095367432)"],[3000,[24,0],"linear"],[4000,[24,0],"linear"]]},
  {nodeId: "111:96",part: "star",property: "opacity",frames: [[0,0,"linear"],[2550,0,"cubic-bezier(0.5,0,0.5,1)"],[2800,1,"linear"],[4000,1,"linear"]]},
  {nodeId: "111:96",part: "star",property: "filter",frames: [[0,16,"linear"],[2550,16,"cubic-bezier(0.5,0,0.5,1)"],[2950,0,"linear"],[4000,0,"linear"]]},
  {nodeId: "111:96",part: "star",property: "scale",frames: [[0,[0.3,0.3],"linear"],[2550,[0.3,0.3],"cubic-bezier(0.47999998927116394,0,0.1899999976158142,0.9900000095367432)"],[3100,[1,1],"linear"],[4000,[1,1],"linear"]]},
  {nodeId: "111:96",part: "star",property: "translate",frames: [[0,[-11.25,0],"linear"],[2550,[-11.25,0],"cubic-bezier(0.47999998927116394,0,0.1899999976158142,0.9900000095367432)"],[3100,[0,0],"linear"],[4000,[0,0],"linear"]]},
];
