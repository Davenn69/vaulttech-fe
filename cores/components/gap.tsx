export type GapProps = {
  value: string;
};

export const Gap = ({ value }: GapProps) => {
  return <div className={value}></div>;
};
