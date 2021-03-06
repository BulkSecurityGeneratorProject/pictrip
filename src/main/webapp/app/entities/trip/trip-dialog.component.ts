import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';
import {FormControl, Validators} from '@angular/forms';

import { Trip} from './trip.model';
import { TripService } from './trip.service';
import { Picture, PictureService } from '../picture';
import { User, UserService } from '../../shared';
import { ResponseWrapper } from '../../shared';
import { Privacy, Color } from './trip.model';
import { PictripAlertUtils } from '../../utils/alert.utils';

@Component({
    selector: 'jhi-trip-dialog',
    templateUrl: './trip-dialog.component.html',
    styleUrls: [
        'trip.scss'
    ]
})
export class TripDialogComponent implements OnInit {

    trip: Trip;
    authorities: any[];
    isSaving: boolean;
    covers: Picture[];
    users: User[];
    dateFromDp: any;
    dateToDp: any;
    routeSub: any;
    tripId: number;

    nameFormControl = new FormControl('', [
        Validators.required,
        Validators.maxLength(80)]);

    constructor(
        private route: ActivatedRoute,
        private alertService: JhiAlertService,
        private tripService: TripService,
        private pictureService: PictureService,
        private userService: UserService,
        private eventManager: JhiEventManager,
        private alertUtils: PictripAlertUtils
    ) {
        this.routeSub = this.route.params.subscribe((params) => {
            const id = params['id'];
            this.tripId = id;
            this.trip = new Trip();
            this.trip.color = this.getRandomColor();
            if (id) {
                this.tripService.find(id).subscribe((trip) => {
                    this.trip = trip;
                });
            }
        });
    }

    ngOnInit() {
        this.isSaving = false;
        this.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
        this.pictureService
            .query({filter: 'trip-is-null'})
            .subscribe((res: ResponseWrapper) => {
                if (!this.trip.coverId) {
                    this.covers = res.json;
                } else {
                    this.pictureService
                        .find(this.trip.coverId)
                        .subscribe((subRes: Picture) => {
                            this.covers = [subRes].concat(res.json);
                        }, (subRes: ResponseWrapper) => this.onError(subRes.json));
                }
            }, (res: ResponseWrapper) => this.onError(res.json));
        this.userService.query()
            .subscribe((res: ResponseWrapper) => { this.users = res.json; }, (res: ResponseWrapper) => this.onError(res.json));
    }

    changePrivacy(newPrivacy: Privacy) {
        this.trip.privacy = newPrivacy;
    }

    save() {
        this.isSaving = true;
        if (this.trip.id !== undefined) {
            this.subscribeToSaveResponse(
                this.tripService.update(this.trip));
        } else {
            this.subscribeToSaveResponse(
                this.tripService.create(this.trip));
        }
    }

    private getRandomColor(): Color {
        const enumValues = Object.keys(Color)
            .map((n) => Number.parseInt(n))
            .filter((n) => !Number.isNaN(n));
        const randomIndex = this.getRandomInt(0, enumValues.length);
        return enumValues[randomIndex];
    }

    private getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
    }

    private subscribeToSaveResponse(result: Observable<Trip>) {
        result.subscribe((res: Trip) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError(res));
    }

    private onSaveSuccess(result: Trip) {
        this.eventManager.broadcast({ name: 'tripListModification', content: 'OK'});
        this.isSaving = false;
        window.history.back();
    }

    public cancel() {
        window.history.back();
    }

    private onSaveError(error) {
        try {
            error.json();
        } catch (exception) {
            error.message = error.text();
        }
        this.isSaving = false;
        this.onError(error);
    }

    private onError(error) {
        this.alertUtils.error(error.message);
    }

    trackPictureById(index: number, item: Picture) {
        return item.id;
    }

    trackUserById(index: number, item: User) {
        return item.id;
    }

    getSelected(selectedVals: Array<any>, option: any) {
        if (selectedVals) {
            for (let i = 0; i < selectedVals.length; i++) {
                if (option.id === selectedVals[i].id) {
                    return selectedVals[i];
                }
            }
        }
        return option;
    }
}
