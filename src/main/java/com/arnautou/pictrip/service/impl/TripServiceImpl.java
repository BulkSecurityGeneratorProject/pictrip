package com.arnautou.pictrip.service.impl;

import com.arnautou.pictrip.service.TripService;
import com.arnautou.pictrip.domain.Trip;
import com.arnautou.pictrip.repository.TripRepository;
import com.arnautou.pictrip.repository.search.TripSearchRepository;
import com.arnautou.pictrip.service.dto.TripDTO;
import com.arnautou.pictrip.service.mapper.TripMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.elasticsearch.index.query.QueryBuilders.*;

/**
 * Service Implementation for managing Trip.
 */
@Service
@Transactional
public class TripServiceImpl implements TripService{

    private final Logger log = LoggerFactory.getLogger(TripServiceImpl.class);

    private final TripRepository tripRepository;

    private final TripMapper tripMapper;

    private final TripSearchRepository tripSearchRepository;

    public TripServiceImpl(TripRepository tripRepository, TripMapper tripMapper, TripSearchRepository tripSearchRepository) {
        this.tripRepository = tripRepository;
        this.tripMapper = tripMapper;
        this.tripSearchRepository = tripSearchRepository;
    }

    /**
     * Save a trip.
     *
     * @param tripDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public TripDTO save(TripDTO tripDTO) {
        log.debug("Request to save Trip : {}", tripDTO);
        Trip trip = tripMapper.toEntity(tripDTO);
        trip = tripRepository.save(trip);
        TripDTO result = tripMapper.toDto(trip);
        tripSearchRepository.save(trip);
        return result;
    }

    /**
     *  Get all the trips.
     *
     *  @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public List<TripDTO> findAll() {
        log.debug("Request to get all Trips");
        return tripRepository.findAllWithEagerRelationships().stream()
            .map(tripMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     *  Get one trip by id.
     *
     *  @param id the id of the entity
     *  @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public TripDTO findOne(Long id) {
        log.debug("Request to get Trip : {}", id);
        Trip trip = tripRepository.findOneWithEagerRelationships(id);
        return tripMapper.toDto(trip);
    }

    /**
     *  Delete the  trip by id.
     *
     *  @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Trip : {}", id);
        tripRepository.delete(id);
        tripSearchRepository.delete(id);
    }

    /**
     * Search for the trip corresponding to the query.
     *
     *  @param query the query of the search
     *  @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public List<TripDTO> search(String query) {
        log.debug("Request to search Trips for query {}", query);
        return StreamSupport
            .stream(tripSearchRepository.search(queryStringQuery(query)).spliterator(), false)
            .map(tripMapper::toDto)
            .collect(Collectors.toList());
    }
}
