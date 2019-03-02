import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const materialWidgetRoutes: Routes = [
	// { path: 'students', component: StudentsTableComponent, data: { animation: 'students' } },
	// { path: 'students/family/:father-or-mother-id', component: StudentsTableComponent, data: { animation: 'fixed' } },
	// { path: 'students/school/:school-symbol', component: StudentsTableComponent, data: { animation: 'fixed' } },
	// { path: 'students/classes/:school-symbol/:class-name', component: StudentsTableComponent, data: { animation: 'fixed' } },
	// { path: 'students/educational-staff/:staff-id', component: StudentsTableComponent, data: { animation: 'fixed' } },
	// { path: 'students/educators/:educator-id', component: StudentsTableComponent, data: { animation: 'fixed' } },
	// { path: 'students/management-team/:employee-id', component: StudentsTableComponent, data: { animation: 'fixed' } },
	// { path: 'students/:students-id', component: StudentsTableComponent, data: { animation: 'fixed' } },


	// { path: 'schools', component: SchoolsTableComponent, data: { animation: 'schools' } },
	// { path: 'schools/family/:father-or-mother-id', component: SchoolsTableComponent, data: { animation: 'fixed' } },
	// { path: 'schools/:school-symbol', component: SchoolsTableComponent, data: { animation: 'fixed' } },

	// { path: 'classes', component: ClassesTableComponent, data: { animation: 'classes' } },
	// { path: 'classes/family/:father-or-mother-id', component: ClassesTableComponent, data: { animation: 'fixed' } },
	// { path: 'classes/school/:school-symbol', component: ClassesTableComponent, data: { animation: 'fixed' } },
	// { path: 'classes/educational-staff/:staff-id', component: ClassesTableComponent, data: { animation: 'fixed' } },
	// { path: 'classes/educators/:educator-id', component: ClassesTableComponent, data: { animation: 'fixed' } },
	// { path: 'classes/management-team/:employee-id', component: ClassesTableComponent, data: { animation: 'fixed' } },
	// { path: 'classes/:school-symbol/:class-name', component: ClassesTableComponent, data: { animation: 'fixed' } },


	// { path: 'educational-staff', component: EducationalStaffTableComponent, data: { animation: 'educational-staff' } },
	// { path: 'educational-staff/educators/school/:school-symbol', component: EducationalStaffTableComponent, data: { animation: 'fixed' } },
	// { path: 'educational-staff/school/:school-symbol', component: EducationalStaffTableComponent, data: { animation: 'fixed' } },
	// tslint:disable-next-line:max-line-length
	// { path: 'educational-staff/educators/classes/:school-symbol/:class-name', component: EducationalStaffTableComponent, data: { animation: 'fixed' } },
	// tslint:disable-next-line:max-line-length
	// { path: 'educational-staff/classes/:school-symbol/:class-name', component: EducationalStaffTableComponent, data: { animation: 'fixed' } },
	// tslint:disable-next-line:max-line-length
	// { path: 'educational-staff/educators/family/:father-or-mother-id', component: EducationalStaffTableComponent, data: { animation: 'fixed' } },
	// { path: 'educational-staff/family/:father-or-mother-id', component: EducationalStaffTableComponent, data: { animation: 'fixed' } },
	// { path: 'educational-staff/:educational-staff-id', component: EducationalStaffTableComponent, data: { animation: 'fixed' } },


	// { path: 'management-team', component: ManagementTeamTableComponent, data: { animation: 'management-team' } },
	// { path: 'management-team/school/:school-symbol', component: ManagementTeamTableComponent, data: { animation: 'fixed' } },
	// { path: 'management-team/family/:father-or-mother-id', component: ManagementTeamTableComponent, data: { animation: 'fixed' } },
	// { path: 'management-team/:management-team-id', component: ManagementTeamTableComponent, data: { animation: 'fixed' } },

	// { path: 'parents', component: ParentsTableComponent, data: { animation: 'parents' } },
	// { path: 'parents/school/:school-symbol', component: ParentsTableComponent, data: { animation: 'fixed' } },
	// { path: 'parents/classes/:school-symbol/:class-name', component: ParentsTableComponent, data: { animation: 'fixed' } },
	// { path: 'parents/educational-staff/:staff-id', component: ParentsTableComponent, data: { animation: 'fixed' } },
	// { path: 'parents/educators/:educator-id', component: ParentsTableComponent, data: { animation: 'fixed' } },
	// { path: 'parents/management-team/:employee-id', component: ParentsTableComponent, data: { animation: 'fixed' } },
	// { path: 'parents/:father-or-mother-id', component: ParentsTableComponent, data: { animation: 'fixed' } },

	// { path: 'data-base/update', component: DbManageComponent, data: { animation: 'data-base' } },

	// { path: 'users', component: UsersComponent, data: { animation: 'data-base' } },



	{ path: '**', redirectTo: 'schools' },

];

@NgModule({
	imports: [
		RouterModule.forChild(materialWidgetRoutes)
	],
	exports: [
		RouterModule
	]
})
export class TablesRouterModule { }
