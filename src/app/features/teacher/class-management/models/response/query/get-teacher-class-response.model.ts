import { ClassModel } from '../../../../../../shared/models/entities/class.model';

export interface GetTeacherClassResponse {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: ClassModel[];
}
