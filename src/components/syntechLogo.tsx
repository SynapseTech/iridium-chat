import { FC, SVGProps } from 'react';

const SyntechLogo: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='3000'
      height='3000'
      viewBox='0 0 793.74998 793.75002'
      version='1.1'
      {...props}
    >
      <path
        fill='currentColor'
        d='m 678.58875,224.25241 -391.11165,0.0459 -53.96582,91.29172 497.72957,-0.44282 47.18109,83.38257 L 588.00075,728.3489 H 205.2544 L 119.24849,576.29494 500.64435,576.5622 565.84565,472.544 58.790724,472.8034 15.328154,396.38105 206.41952,65.401101 h 381.56483 z'
      />
    </svg>
  );
};

export default SyntechLogo;
