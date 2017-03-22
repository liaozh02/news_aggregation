import { Pipe, PipeTransform } from '@angular/core';
import { Problem } from '../models/problem.model'

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(problems: Problem[], keyword: string): Problem[] {
    return problems.filter(problem =>
      problem.name.toLowerCase().includes(keyword));
  }

}
