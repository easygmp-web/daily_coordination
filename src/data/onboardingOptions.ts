export type AgeGroup =
  | '20대'
  | '30대'
  | '40대'
  | '50대'
  | '60대'
  | '70대 이상';

export type GenderOption = '여성' | '남성' | '선택 안 함';

export type OutfitStyleId = 'casual' | 'neat' | 'active' | 'classic';

export interface StyleOption {
  id: OutfitStyleId;
  name: string;
  description: string;
}

export const AGE_GROUPS: readonly AgeGroup[] = [
  '20대',
  '30대',
  '40대',
  '50대',
  '60대',
  '70대 이상',
];

export const GENDER_OPTIONS: readonly GenderOption[] = [
  '여성',
  '남성',
  '선택 안 함',
];

export const STYLE_OPTIONS: readonly StyleOption[] = [
  {
    id: 'casual',
    name: '편안한 캐주얼',
    description: '동네 산책·장보기, 편하고 무난하게',
  },
  {
    id: 'neat',
    name: '단정한 외출복',
    description: '모임·병원·관공서, 깔끔하게',
  },
  {
    id: 'active',
    name: '활동적인 운동복',
    description: '걷기·등산·운동, 가볍고 따뜻하게',
  },
  {
    id: 'classic',
    name: '차분한 클래식',
    description: '격식 있는 자리, 고급스럽게',
  },
];
